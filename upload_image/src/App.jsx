import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { FrappeApp } from "frappe-js-sdk";
import LoaderComponent from "./Loader";

function App() {
  const frappeUrl = window.location.origin + "/";
  const siteurl = frappeUrl;
  const frappe = new FrappeApp(siteurl);
  const auth = frappe.auth();
  const db = frappe.db();
  const files = frappe.file();

  const [folders, setFolders] = useState([]);
  const [count, setCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentFolderIndex, setCurrentFolderIndex] = useState(null);
  const [currentSubFolderIndex, setCurrentSubFolderIndex] = useState(null);
  const [parentfolder, setParentfolder] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userManuallyChanged, setUserManuallyChanged] = useState(false);
  const [foldertype, setfoldertype] = useState([
    "Post Install Folder",
    "Pre Install Folder",
  ]);
  const [status, setStatus] = useState([
    "No started - Auto generated",
    "In progress - Site assesor",
    "On hold - Site Assessor",
    "Assessment completed - Site Assessor",
    "Site Visit Completed - Engineer",
  ]);
  const [getingdata, setgetingdata] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [userstate, setuserstate] = useState("");
  const [newUser, setnewUser] = useState("");
  const [foldername, setfoldername] = useState("");
  const [usercountry, setusercountry] = useState("");
  const [userstreet, setuserstreet] = useState("");
  const [userPermissions, setUserPermissions] = useState({
    can_upload: false,
    can_edit: false,
    can_delete: false,
    can_view: true
  });
  const [hasAccess, setHasAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  useEffect(() => {
    const checkFrappeAuth = async () => {
      try {
        // Check if user is already logged in to Frappe
        const session = await frappe.call('image_uploader.api.spa_auth.get_spa_session');
        if (session && session.user && session.user !== 'Guest') {
          console.log('User already logged in to Frappe:', session.user);
          
          // Check permissions using the same API that works for upload button
          try {
            const response = await fetch('/api/method/image_uploader.api.spa_auth.check_permissions', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (response.ok) {
              const result = await response.json();
              const permissions = result.message || result;
              
              // Check if user has any upload permissions (same logic as upload button)
              if (permissions.can_upload || permissions.can_edit || permissions.can_delete) {
                console.log('User has access based on permissions:', permissions);
                setIsLoggedIn(true);
                setHasAccess(true);
                setAccessMessage("Access granted");
                document.querySelector("#login").style.display = "none";
                document.querySelector("#allfeild").style.display = "block";
                document.querySelector("#access-denied").style.display = "none";
                return;
              } else {
                console.log('User does not have required permissions:', permissions);
                setHasAccess(false);
                setAccessMessage("Access denied. You need Image Uploader or Site Assessor role to access this application.");
                document.querySelector("#login").style.display = "none";
                document.querySelector("#allfeild").style.display = "none";
                document.querySelector("#access-denied").style.display = "block";
                return;
              }
            }
          } catch (permError) {
            console.log('Error checking permissions:', permError);
          }
        }
      } catch (error) {
        console.log('Not logged in to Frappe, showing login form');
      }
      
      // Fallback to localStorage check
      const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
      if (storedIsLoggedIn === "true") {
        setIsLoggedIn(true);
        checkLogoutTimer();
        document.querySelector("#login").style.display = "none";
        document.querySelector("#allfeild").style.display = "block";
      }
    };
    
    checkFrappeAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🔍 Login attempt started for user:', username);
    try {
      const auth = frappe.auth();
      await auth.loginWithUsernamePassword({ username, password });

      console.log('🔍 Login successful, checking permissions...');
      
      // Check permissions using the same API that works for upload button
      try {
        const response = await fetch('/api/method/image_uploader.api.spa_auth.check_permissions', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          const permissions = result.message || result;
          
          console.log('🔍 Permissions result:', permissions);
          
          // Check if user has any upload permissions (same logic as upload button)
          if (permissions.can_upload || permissions.can_edit || permissions.can_delete) {
            console.log('🔍 User has access based on permissions:', permissions);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loginTime", new Date().getTime());
            setIsLoggedIn(true);
            setHasAccess(true);
            setAccessMessage("Access granted");
            startLogoutTimer();
            document.querySelector("#login").style.display = "none";
            document.querySelector("#allfeild").style.display = "block";
            document.querySelector("#access-denied").style.display = "none";
          } else {
            console.log('🔍 User does not have required permissions:', permissions);
            setHasAccess(false);
            setAccessMessage("Access denied. You need Image Uploader or Site Assessor role to access this application.");
            document.querySelector("#login").style.display = "none";
            document.querySelector("#allfeild").style.display = "none";
            document.querySelector("#access-denied").style.display = "block";
          }
        } else {
          console.log('🔍 Permission check failed');
          alert("Login successful but unable to verify permissions. Please contact administrator.");
        }
      } catch (permError) {
        console.error('🔍 Error checking permissions after login:', permError);
        alert("Login successful but unable to verify permissions. Please contact administrator.");
      }
      
    } catch (error) {
      console.error("🔍 Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const startLogoutTimer = () => {
    setTimeout(() => {
      logout();
    }, 12 * 60 * 60 * 1000);
  };

  const checkLogoutTimer = () => {
    const loginTime = parseInt(localStorage.getItem("loginTime"));
    if (!isNaN(loginTime)) {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - loginTime;
      if (elapsedTime >= 12 * 60 * 60 * 1000) {
        logout();
        document.querySelector("#login").style.display = "block";
        document.querySelector("#allfeild").style.display = "none";
      } else {
        const remainingTime = 12 * 60 * 60 * 1000 - elapsedTime;
        startLogoutTimer(remainingTime);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    setIsLoggedIn(false);
  };

  function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(window.location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // Get the parameters from the URL
  const lead = getUrlParameter("lead");
  const firstName = getUrlParameter("first_name");
  const typeoffolder = getUrlParameter("type");

  useEffect(() => {
    if (lead) {
      setParentfolder(lead);
    }
  }, [lead]);
  const [selectedUser, setSelectedUser] = useState(firstName);
  const [selectedFolderType, setSelectedFolderType] = useState(typeoffolder);
  const fieldRef = useRef(null);
  const [folderlist, setFolderList] = useState("");
  const [inputValue, setInputValue] = useState(
    firstName.length > 0 ? firstName : ""
  );

  const loadExistingImages = async () => {
    try {
      console.log("Loading existing images...");
      console.log("Current parentfolder:", parentfolder);
      console.log("Current fieldRef value:", fieldRef.current?.value);
      console.log("Current folders:", folders.length);
      
      if (!parentfolder || !fieldRef.current?.value) {
        console.log("Missing parentfolder or fieldRef, skipping image load");
        return;
      }
      
      // Get all folders and their subfolders
      const updatedFolders = await Promise.all(
        folders.map(async (folder) => {
          const updatedSubfolders = await Promise.all(
            folder.subfolders.map(async (subfolder) => {
              try {
                // Construct the proper folder path
                const folderParts = ['Home'];
                if (parentfolder) folderParts.push(parentfolder);
                if (fieldRef.current?.value) folderParts.push(fieldRef.current.value);
                if (folder.mainname) folderParts.push(folder.mainname);
                if (subfolder.name) folderParts.push(subfolder.name);
                
                const properFolderPath = folderParts.join('/');
                console.log(`Loading images for path: ${properFolderPath}`);
                
                // Get existing images from this subfolder
                const existingImages = await db.getDocList("File", {
                  fields: ["name", "file_name", "file_url", "flag"],
                  filters: [
                    ["folder", "=", properFolderPath],
                    ["is_folder", "=", 0]
                  ],
                });
                
                console.log(`Found ${existingImages.length} images for ${subfolder.name}`);
                
                // Convert to image objects
                const imageObjects = existingImages.map(img => ({
                  id: img.name,
                  name: img.file_name,
                  src: img.file_url,
                  flag: img.flag || false
                }));
                
                // Get the subfolder description from the folder itself
                let subfolderDescription = "";
                try {
                  const subfolderDoc = await db.getDocList("File", {
                    fields: ["description"],
                    filters: [
                      ["folder", "=", folderParts.slice(0, -1).join('/')],
                      ["file_name", "=", subfolder.name],
                      ["is_folder", "=", 1]
                    ],
                    limit: 1
                  });
                  
                  if (subfolderDoc.length > 0) {
                    subfolderDescription = subfolderDoc[0].description || "";
                    console.log(`Loaded description for ${subfolder.name}: "${subfolderDescription}"`);
                  }
                } catch (error) {
                  console.error(`Error loading description for ${subfolder.name}:`, error);
                }
                
                return {
                  ...subfolder,
                  images: imageObjects,
                  description: subfolderDescription
                };
              } catch (error) {
                console.error(`Error loading images for ${subfolder.name}:`, error);
                return subfolder;
              }
            })
          );
          
          return {
            ...folder,
            subfolders: updatedSubfolders
          };
        })
      );
      
      setFolders(updatedFolders);
      console.log("Existing images loaded successfully");
    } catch (error) {
      console.error("Error loading existing images:", error);
    }
  };

  const initializeFolders = async (e) => {
    try {
      let post_install_folder_list = [];
      let pre_install_folder_list = [];

      let data = [
        [
          "Roof Measurements",
          [
            ["Complete with all the measurements", ""],
            ["Roof Obstructions", ""],
            ["Tilts of every plane", ""],
          ],
        ],
        [
          "Electrical",
          [
            ["MSP (wide-angle)", ""],
            ["MSP Cover", ""],
            ["MSP Main Breaker", ""],
            ["MSP (close-up, cover off)", ""],
            ["MSP Voltage", ""],
            ["Water main grounding", ""],
            ["Meter (close-up)", ""],
            ["Meter (wide-angle)", ""],
            ["Service Conduit", ""],
            ["Is there a sub-panel?", ""],
            ["Sub Panel", ""],
            ["Electrical Red Flags", ""],
            ["Ground rod/Clamp", ""],
          ],
        ],
        [
          "Rafters and Attic",
          [
            ["Size of Rafters", ""],
            ["Spacing of Rafters", ""],
            ["Attic Photos", ""],
            ["Rafter/attic red flags", ""],
            ["Working space in attic?", ""],
          ],
        ],
        [
          "Elevation",
          [
            ["Aurora Layout Picture", ""],
            ["Front of Home", ""],
            ["Right Side of Home", ""],
            ["Left Side of Home", ""],
            ["Rear of Home", ""],
            ["Is there a detached structure?", ""],
            ["Detached structure photos", ""],
            ["Is there a sub-panel in the detached structure?", ""],
            ["Distance of trench", ""],
            ["Trench details", ""],
            ["Additional exterior comments", ""],
          ],
        ],
        [
          "Roofing Material",
          [
            ["Potential Shading Issues?", ""],
            ["Layers of shingle", ""],
            ["Shading Issues", ""],
            ["Roof condition passes?", ""],
            ["Roof red flags", ""],
            ["Additional roof comments", ""],
          ],
        ],
        ["Miscellaneous Photos", [["Miscellaneous Photos", ""]]],
        [
          "Existing System",
          [
            ["Is there an existing system?", ""],
            ["Module Type and Quantity", ""],
            ["Inverter Type and Quantity", ""],
          ],
        ],
      ];
      const newFolders = data.map(([mainHeading, subheadings], mainIndex) => {
        const folder = {
          index: mainIndex + 1,
          mainname: mainHeading,
          minimized: false,
          subfolders: subheadings.map(
            ([subheading, value, description], subIndex) => ({
              id: mainIndex * 10 + subIndex + 1,
              name: subheading,
              value: value,
              images: [],
              description: description || "",
            })
          ),
        };
        return folder;
      });
      setFolders(newFolders);
    } catch (error) {
      console.error("Error initializing folders:", error);
    }
  };
  useEffect(() => {
    initializeFolders();
  }, [fieldRef.current?.value]);

  // Load existing images when folders are loaded and user is logged in
  useEffect(() => {
    if (isLoggedIn && folders.length > 0 && parentfolder && fieldRef.current?.value) {
      console.log("Triggering loadExistingImages...");
      loadExistingImages();
    }
  }, [isLoggedIn, folders.length, parentfolder, fieldRef.current?.value]);

  useEffect(() => {
    if (!userManuallyChanged && invoiceList.length > 0) {
      const defaultUser =
        invoiceList.find((user) => user.title.includes(firstName))?.title ||
        invoiceList[0].title ||
        " ";
      setSelectedUser(defaultUser);
    }
  }, [invoiceList, firstName, userManuallyChanged]);

  const callfolder = async () => {
    setgetingdata(true);
    document.querySelector(".folders-container").style.display = "none";
    let foldlist = [];
    const feildname = fieldRef.current.value;
    setFolderList(feildname);
    try {
      const docs = await db.getDocList("File", {
        fields: ["name", "file_name"],
        filters: [
          ["folder", "=", "Home"],
          ["is_folder", "=", 1],
          ["file_name", "=", parentfolder],
        ],
      });
      if (docs.length > 0) {
        // console.log(docs, "itrs asdnjskadfn");
        let userdetails = await db.getDoc("Lead", docs[0].file_name);
        setnewUser(userdetails.title);
        userdetails.custom_street.length > 0
          ? setuserstreet("")
          : setuserstreet(userdetails.custom_street);

        userdetails.custom_state1.length > 0
          ? setuserstate("")
          : setuserstate(userdetails.custom_state1);

        userdetails.custom_country1.length > 0
          ? setusercountry("")
          : setusercountry(userdetails.custom_country1);
        foldlist = await db.getDocList("File", {
          fields: ["name", "file_name"],
          filters: [
            ["folder", "=", `Home/${parentfolder}`],
            ["is_folder", "=", 1],
            ["file_name", "=", feildname],
          ],
        });
      } else {
        initializeFolders();
      }
      if (foldlist.length > 0) {
        const mainFolders = await db.getDocList("File", {
          fields: ["name", "file_name", "idx"],
          filters: [
            ["folder", "=", `Home/${parentfolder}/${feildname}`],
            ["is_folder", "=", 1],
          ],
          orderBy: {
            field: "creation",
            order: "asc",
          },
        });
        const allSubfolders = await Promise.all(
          mainFolders.map(async (mainFolder) => {
            const subFolders = await db.getDocList("File", {
              fields: ["name", "file_name"],
              filters: [
                [
                  "folder",
                  "=",
                  `Home/${parentfolder}/${feildname}/${mainFolder.file_name}`,
                ],
                ["is_folder", "=", 1],
              ],
            });

            let totalImageCount = 0;

            const subfolderImages = await Promise.all(
              subFolders.map(async (subFolder) => {
                const images = await db.getDocList("File", {
                  fields: ["name", "file_name", "file_url", "flag"],
                  filters: [
                    [
                      "folder",
                      "=",
                      `Home/${parentfolder}/${feildname}/${mainFolder.file_name}/${subFolder.file_name}`,
                    ],
                  ],
                });
                console.log(images);
                const imageList = images.map((img) => ({
                  src: `${siteurl}${img.file_url}`,
                  name: img.file_name,
                  id: img.name,
                  flag: img.flag || false,
                }));

                totalImageCount += imageList.length;

                return {
                  id: subFolder.name,
                  name: subFolder.file_name,
                  images: imageList,
                  minimized: false,
                };
              })
            );

            return {
              idx: mainFolder.idx,
              id: mainFolder.name,
              mainname: mainFolder.file_name,
              subfolders: subfolderImages,
              imageCount: totalImageCount,
            };
          })
        );

        setFolders(allSubfolders);
      } else {
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
    setCount(1);
    setgetingdata(false);
    document.querySelector(".folders-container").style.display = "block";
  };

  useEffect(() => {
    if (count === 0) {
      callfolder();
    }
  }, [parentfolder, folderlist]);

  const callUser = async () => {
    try {
      let newUsers = [];
      const docs = await db.getDocList("Lead", {
        fields: ["title", "name", "street", "city1", "state1", "country1"],
        limit: 10000,
      });
      console.log(docs);

      newUsers = docs.map((doc) => ({
        title: doc.title,
        name: doc.name,
        state: doc.street ? doc.street : "",
        state1: doc.city1 ? doc.city1 : "",
        state2: doc.state1 ? doc.state1 : "",
        state3: doc.country1 ? doc.country1 : "",
      }));

      setInvoiceList(newUsers);
    } catch (error) {
      console.error("There was an error while fetching the documents:", error);
    }
  };

  useEffect(() => {
    if (count === 1) {
      callUser();
    }
    ("");
  }, [count]);

  const callnewfolder = async (e) => {
    console.log(e);
    setgetingdata(true);
    document.querySelector(".folders-container").style.display = "none";
    let foldlist = [];
    const feildname = fieldRef.current.value;
    setFolderList(feildname);
    try {
      let newUsers = [];
      const userDoc = await db.getDoc("Lead", e.name);
      if (userDoc.lead_name === e.title) {
        setParentfolder(userDoc.name);
        setnewUser(userDoc.title);
        userDoc.custom_street.length > 0
          ? setuserstreet("")
          : setuserstreet(userDoc.custom_street);

        userDoc.custom_state1.length > 0
          ? setuserstate("")
          : setuserstate(userDoc.custom_state1);

        userDoc.custom_country1.length > 0
          ? setusercountry("")
          : setusercountry(userDoc.custom_country1);
        try {
          const docs = await db.getDocList("File", {
            fields: ["name", "file_name"],
            filters: [
              ["folder", "=", "Home"],
              ["is_folder", "=", 1],
              ["file_name", "=", e.name],
            ],
          });
          if (docs.length > 0) {
            foldlist = await db.getDocList("File", {
              fields: ["name", "file_name"],
              filters: [
                ["folder", "=", `Home/${e.name}`],
                ["is_folder", "=", 1],
                ["file_name", "=", feildname],
              ],
            });
          } else {
            initializeFolders(e);
          }
          if (foldlist.length > 0) {
            const mainFolders = await db.getDocList("File", {
              fields: ["name", "file_name", "idx"],
              filters: [
                ["folder", "=", `Home/${e.name}/${feildname}`],
                ["is_folder", "=", 1],
              ],
              orderBy: {
                field: "creation",
                order: "asc",
              },
            });
            const allSubfolders = await Promise.all(
              mainFolders.map(async (mainFolder) => {
                const subFolders = await db.getDocList("File", {
                  fields: ["name", "file_name"],
                  filters: [
                    [
                      "folder",
                      "=",
                      `Home/${e.name}/${feildname}/${mainFolder.file_name}`,
                    ],
                    ["is_folder", "=", 1],
                  ],
                });

                let totalImageCount = 0;

                const subfolderImages = await Promise.all(
                  subFolders.map(async (subFolder) => {
                    const images = await db.getDocList("File", {
                      fields: [
                        "name",
                        "file_name",
                        "file_url",
                        "flag",
                      ],
                      filters: [
                        [
                          "folder",
                          "=",
                          `Home/${e.name}/${feildname}/${mainFolder.file_name}/${subFolder.file_name}`,
                        ],
                      ],
                    });

                    const imageList = images.map((img) => ({
                      src: `${siteurl}${img.file_url}`,
                      name: img.file_name,
                      id: img.name,
                      flag: img.flag || false,
                    }));

                    totalImageCount += imageList.length;

                    return {
                      id: subFolder.name,
                      name: subFolder.file_name,
                      images: imageList,
                      minimized: false,
                    };
                  })
                );

                return {
                  idx: mainFolder.idx,
                  id: mainFolder.name,
                  mainname: mainFolder.file_name,
                  subfolders: subfolderImages,
                  imageCount: totalImageCount,
                };
              })
            );

            setFolders(allSubfolders);
          } else {
            initializeFolders();
          }
        } catch (error) {
          console.error("Error fetching folders:", error);
        }
      }
    } catch (error) {
      console.error("There was an error while fetching the documents:", error);
    }
    setgetingdata(false);
    document.querySelector(".folders-container").style.display = "block";
  };

  const handleSelectChange1 = (event) => {
    let status = event.target.value;
    console.log(status, "it's an status");
    console.log(parentfolder, "parentfolder");
    db.updateDoc("Lead", parentfolder, {
      custom_final__status: status,
    })
      .then((doc) => console.log(doc))
      .catch((error) => console.error(error));
  };

  const handleChange = async (e) => {
    setInputValue(e.target.value);
    setUserManuallyChanged(true);
    setSelectedUser(e.target.value);
    const selectedInvoice = invoiceList.find(
      (invoice) => invoice.title === e.target.value
    );
    console.log(selectedInvoice, "selected invoice");
    if (invoiceList.includes(selectedInvoice)) {
      await callnewfolder(selectedInvoice);
    }
  };

  const handleFolderClick = (folder, index) => {
    setCurrentFolderIndex(index);
    const updatedFolders = folders.map((f, i) =>
      i === index ? { ...f, minimized: !f.minimized } : f
    );
    setFolders(updatedFolders);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImages([]);
    setSelectedName(null);
  };

  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % selectedImages.length;
      setSelectedName(selectedImages[newIndex].name);
      return newIndex;
    });
  };

  const showPrevImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const newIndex =
        prevIndex === 0 ? selectedImages.length - 1 : prevIndex - 1;
      setSelectedName(selectedImages[newIndex].name);
      return newIndex;
    });
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    setSelectedName(selectedImages[index].name);
    setModalVisible(true);
    setCurrentFolderIndex(folderIndex);
    setCurrentSubFolderIndex(subfolderIndex);
  };

  const handleDescriptionChange = async (
    folderIndex,
    subfolderIndex,
    description
  ) => {
    const subfolder = folders[folderIndex].subfolders[subfolderIndex];
    const existingDescription = subfolder.description || "";
    
    // Check permissions: Image Uploader can only ADD (when empty), not EDIT existing
    // Site Assessor can always edit
    if (!userPermissions.can_delete && existingDescription && existingDescription.trim() !== "") {
      // Image Uploader trying to edit existing description - prevent it
      alert("Only Site Assessors can edit existing descriptions. You can only add descriptions when the field is empty.");
      // Revert to original value
      setFolders((prevFolders) => {
        const updatedFolders = [...prevFolders];
        updatedFolders[folderIndex].subfolders[
          subfolderIndex
        ].description = existingDescription;
        return updatedFolders;
      });
      return;
    }
    
    // Update the state immediately for UI responsiveness
    setFolders((prevFolders) => {
      const updatedFolders = [...prevFolders];
      updatedFolders[folderIndex].subfolders[
        subfolderIndex
      ].description = description;
      return updatedFolders;
    });

    // Save to database
    try {
      const feildname = fieldRef.current ? fieldRef.current.value : "";
      const mainFolderName = folders[folderIndex]?.mainname;
      
      // Construct the folder path for the subfolder
      const folderParts = ['Home'];
      if (parentfolder) folderParts.push(parentfolder);
      if (feildname) folderParts.push(feildname);
      if (mainFolderName) folderParts.push(mainFolderName);
      
      const parentFolderPath = folderParts.join('/');
      
      // Find the subfolder document in the database
      const subfolderDoc = await db.getDocList("File", {
        fields: ["name"],
        filters: [
          ["folder", "=", parentFolderPath],
          ["file_name", "=", subfolder.name],
          ["is_folder", "=", 1]
        ],
        limit: 1
      });
      
      if (subfolderDoc.length > 0) {
        // Update the existing subfolder document
        await db.updateDoc("File", subfolderDoc[0].name, {
          description: description
        });
        console.log(`Description saved for ${subfolder.name}: "${description}"`);
      } else {
        console.log(`Subfolder document not found for ${subfolder.name}`);
      }
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };

  const addFolder = () => {
    setFolders([...folders, { id: Date.now(), name: "", images: [] }]);
  };

  const handleImageChange = async (
    folderIndex,
    subfolderIndex,
    subfoldername,
    event
  ) => {
    setLoading(true);
    console.log(subfoldername);
    const files = Array.from(event.target.files);
    const imageObjects = files.map((file) => ({
      src: URL.createObjectURL(file),
      name: file.name,
      flag: false,
    }));
    console.log("image added", imageObjects);
    let updatedSubfolder;
    const updatedFolders = folders.map((folder, fIndex) => {
      if (fIndex === folderIndex) {
        const updatedSubfolders = folder.subfolders.map((subfolder, sIndex) => {
          if (sIndex === subfolderIndex) {
            updatedSubfolder = {
              ...subfolder,
              images: [...subfolder.images, ...imageObjects],
            };
            return updatedSubfolder;
          }
          return subfolder;
        });
        const newImageCount = updatedSubfolders.reduce(
          (count, subfolder) => count + subfolder.images.length,
          0
        );
        return {
          ...folder,
          subfolders: updatedSubfolders,
          imageCount: newImageCount,
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    if (updatedSubfolder) {
      await createfolders(updatedSubfolder, folderIndex, subfolderIndex);
      console.log("Updated Subfolder:", updatedSubfolder);
    } else {
      console.error("Updated subfolder not found.");
    }

    setLoading(false);
  };

  const toggleFlag = async (
    folderIndex,
    subfolderIndex,
    imageIndex,
    subfoldername,
    event
  ) => {
    event.stopPropagation();
    setLoading(true);
    const updatedFolders = folders.map((folder, fIndex) => {
      if (fIndex === folderIndex) {
        const updatedSubfolders = folder.subfolders.map((subfolder, sIndex) => {
          if (sIndex === subfolderIndex) {
            if (subfolder.name === subfoldername) {
              const updatedImages = subfolder.images.map((image, iIndex) => {
                if (iIndex === imageIndex) {
                  const newFlagValue = !image.flag;
                  return { ...image, flag: newFlagValue };
                }
                return image;
              });
              return { ...subfolder, images: updatedImages };
            }
          }
          return subfolder;
        });
        return { ...folder, subfolders: updatedSubfolders };
      }
      return folder;
    });
    setFolders(updatedFolders);
    const updatedSubfolder = updatedFolders[folderIndex].subfolders.find(
      (subfolder) => subfolder.name === subfoldername
    );
    if (updatedSubfolder) {
      await createfolders(updatedSubfolder, folderIndex, subfolderIndex);
      console.log("Updated Subfolder:", updatedSubfolder);
    } else {
      console.error(`Subfolder '${subfoldername}' not found.`);
    }
    setLoading(false);
  };

  const handleEditImage = async (
    folderIndex,
    subfolderIndex,
    subfoldername,
    imageIndex,
    event
  ) => {
    event.stopPropagation();
    
    // Check if user has delete permission
    if (!userPermissions.can_delete) {
      alert('You do not have permission to delete images. Please contact your administrator.');
      return;
    }
    
    setLoading(true);

    const updatedFolders = folders.map((folder, fIndex) => {
      if (fIndex === folderIndex) {
        const updatedSubfolders = folder.subfolders.map((subfolder, sIndex) => {
          if (sIndex === subfolderIndex) {
            if (subfolder.name === subfoldername) {
              const updatedImages = subfolder.images.filter(
                (_, iIndex) => iIndex !== imageIndex
              );
              const deletedImage = subfolder.images[imageIndex];
              console.log(deletedImage, "the image that we have deleted");
              if (deletedImage.id) {
                deleteImageFromBackend(
                  folder.mainname,
                  subfolder.name,
                  deletedImage.id
                );
              }
              return { ...subfolder, images: updatedImages };
            }
          }
          return subfolder;
        });
        // Update the imageCount here
        const newImageCount = updatedSubfolders.reduce(
          (count, subfolder) => count + subfolder.images.length,
          0
        );
        return {
          ...folder,
          subfolders: updatedSubfolders,
          imageCount: newImageCount,
        };
      }
      return folder;
    });

    setFolders(updatedFolders);

    const updatedSubfolder = updatedFolders[folderIndex].subfolders.find(
      (subfolder) => subfolder.name === subfoldername
    );
    if (updatedSubfolder) {
      await createfolders(updatedSubfolder, folderIndex, subfolderIndex);
      console.log("Updated Subfolder:", updatedSubfolder);
    } else {
      console.error(`Subfolder '${subfoldername}' not found.`);
    }

    setLoading(false);
  };

  const deleteImageFromBackend = async (
    mainFolderName,
    subFolderName,
    imageId
  ) => {
    try {
      await db.deleteDoc("File", imageId);
      console.log(`Image ${imageId} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting image ${imageId} from the backend:`, error);
    }
  };
  const [loading, setLoading] = useState(false);

  // Check user permissions when app loads
  useEffect(() => {
    console.log('🔍 Permission useEffect triggered, isLoggedIn:', isLoggedIn);
    
    const checkPermissions = async () => {
      try {
        console.log('🔍 Checking permissions for logged-in user...');
        
        // Use direct HTTP calls instead of Frappe SDK
        try {
          console.log('🔍 Making direct HTTP call to check permissions...');
          const response = await fetch('/api/method/image_uploader.api.spa_auth.check_permissions', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('🔍 Direct HTTP permissions result:', result);
            
            // Handle the response structure - permissions might be in result.message
            const permissions = result.message || result;
            console.log('🔍 Extracted permissions:', permissions);
            setUserPermissions(permissions);
          } else {
            console.log('🔍 HTTP call failed, setting restricted permissions');
            setUserPermissions({
              can_upload: false,
              can_edit: false,
              can_delete: false,
              can_view: true
            });
          }
        } catch (error) {
          console.log('🔍 HTTP call error, setting restricted permissions:', error);
          setUserPermissions({
            can_upload: false,
            can_edit: false,
            can_delete: false,
            can_view: true
          });
        }
      } catch (error) {
        console.error('🔍 Error checking permissions:', error);
        // Default to restricted permissions if check fails
        setUserPermissions({
          can_upload: false,
          can_edit: false,
          can_delete: false,
          can_view: true
        });
      }
    };

    if (isLoggedIn) {
      console.log('🔍 User is logged in, calling checkPermissions in 100ms...');
      // Add a small delay to ensure session is fully established
      setTimeout(() => {
        checkPermissions();
      }, 100);
    } else {
      console.log('🔍 User is not logged in, skipping permission check');
    }
  }, [isLoggedIn]);

  // Function to ensure folder structure exists
  const ensureFolderExists = async (folderPath) => {
    try {
      console.log("Ensuring folder exists:", folderPath);
      
      // Split the path into parts
      const pathParts = folderPath.split('/');
      
      // Build the path incrementally and create each folder if it doesn't exist
      for (let i = 1; i < pathParts.length; i++) {
        const currentPath = pathParts.slice(0, i + 1).join('/');
        const folderName = pathParts[i];
        const parentPath = pathParts.slice(0, i).join('/');
        
        // Check if this folder exists
        const existingFolder = await db.getDocList("File", {
          fields: ["name"],
          filters: [
            ["folder", "=", parentPath],
            ["file_name", "=", folderName],
            ["is_folder", "=", 1]
          ],
          limit: 1
        });
        
        if (existingFolder.length === 0) {
          console.log("Creating folder:", currentPath);
          // Create the folder
          await db.createDoc("File", {
            file_name: folderName,
            is_folder: 1,
            folder: parentPath
          });
        }
      }
      
      console.log("Folder structure ensured for:", folderPath);
    } catch (error) {
      console.error("Error ensuring folder exists:", error);
      throw error;
    }
  };

  const createfolders = async (subfolder, folderIndex, subfolderIndex) => {
    const feildname = fieldRef.current ? fieldRef.current.value : "";
    console.log(feildname, "feildname");
    console.log(subfolder, "this is the subfolder");
    
    // Get the main folder name from the current folders state
    const mainFolderName = folders[folderIndex]?.mainname;
    console.log("Main folder name:", mainFolderName);
    
    // Construct the proper folder path for this subfolder
    // Handle empty parentfolder to avoid double slashes
    const folderParts = ['Home'];
    if (parentfolder) folderParts.push(parentfolder);
    if (feildname) folderParts.push(feildname);
    if (mainFolderName) folderParts.push(mainFolderName);
    if (subfolder.name) folderParts.push(subfolder.name);
    
    const properFolderPath = folderParts.join('/');
    console.log("Proper folder path:", properFolderPath);
    
    // Ensure folder structure exists before uploading files
    await ensureFolderExists(properFolderPath);
    
    try {
      const existingImagesInSubFolder = await db.getDocList("File", {
        fields: ["name", "file_name", "flag"],
        filters: [["folder", "=", properFolderPath]],
      });

      const existingImageNames = existingImagesInSubFolder.map(
        (img) => img.file_name
      );
      for (const existingImage of existingImagesInSubFolder) {
        const correspondingNewImage = subfolder.images.find(
          (img) => img.name === existingImage.file_name
        );
        if (correspondingNewImage) {
          if (existingImage.flag !== correspondingNewImage.flag) {
            await db.updateDoc("File", existingImage.name, {
              flag: correspondingNewImage.flag,
            });
          }
          // Assign the existing image ID to the new image object
          correspondingNewImage.id = existingImage.name;
        }
      }

      const newImages = subfolder.images.filter(
        (image) => !existingImageNames.includes(image.name)
      );

      const fetchImageBlob = async (imageUrl) => {
        const response = await fetch(imageUrl);
        return await response.blob();
      };

      const blobs = await Promise.all(
        newImages.map((img) => fetchImageBlob(img.src))
      );

      const images = blobs.map((blob, index) => {
        const img = newImages[index];
        return new File([blob], img.name, { type: blob.type });
      });

      const fileArgs = {
        flag: true,
        folder: properFolderPath, // Use the proper folder path
        doctype: "File",
        docname: "",
        fieldname: "file",
      };

      for (const image of images) {
        const response = await files.uploadFile(
          image,
          fileArgs,
          (completedBytes, totalBytes) =>
            console.log(Math.round((completedBytes / totalBytes) * 100))
        );
        console.log(response.data.message.name);
        const newImageId = response?.data?.message?.name;
        if (newImageId) {
          subfolder.images.forEach((img) => {
            if (img.name === image.name) {
              img.id = newImageId;
            }
          });
        }
      }

      // Update the state with new image IDs
      setFolders((prevFolders) => {
        const updatedFolders = [...prevFolders];
        updatedFolders[folderIndex].subfolders[subfolderIndex] = subfolder;
        return updatedFolders;
      });
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const openpdf = () => {
    document.querySelector(".pdf").style.display = "block";
    document.querySelector(".main").style.display = "none";
  };
  const createdoc = () => {
    db.createDoc("image printer", {
      title: "Test",
      select: document.querySelector("#size").value,
      flag: document.querySelector("#flags").value,
      folder: document.querySelector("#folder").value,
      lead_ref: parentfolder,
    })
      .then((doc) => {
        window.open(doc.file_link, "_blank");
      })
      .catch((error) => console.error(error));
  };

  const closepdf = () => {
    document.querySelector(".pdf").style.display = "none";
    document.querySelector(".main").style.display = "block";
  };

  const [shrinkStatus, setShrinkStatus] = useState({});

  const toggleShrink = (folderIndex, subfolderIndex) => {
    setShrinkStatus((prevState) => ({
      ...prevState,
      [`${folderIndex}-${subfolderIndex}`]:
        !prevState[`${folderIndex}-${subfolderIndex}`],
    }));
  };

  return (
    <>
      <div
        id="login"
        style={{
          backgroundColor: "#f8f9fa",
          display: isLoggedIn ? "none" : "block",
        }}
        className="login"
      >
          <div
            className="Contaner"
            style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <main
              className="form-signin"
              style={{
                maxWidth: "400px",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <form>
                <h1 className="h3 mb-3 fw-normal text-center">
                  Please sign in
                </h1>

                <div className="form-floating">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingInput"
                    placeholder="name@example.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                  <label htmlFor="floatingInput">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPassword"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>
                <button
                  className="btn btn-primary w-100 py-2"
                  type="button"
                  onClick={handleLogin}
                  style={{ borderRadius: "10px" }}
                >
                  Sign in
                </button>
              </form>
            </main>
          </div>
        </div>
      
      {/* Access Denied Component */}
      <div
        id="access-denied"
        style={{
          backgroundColor: "#f8f9fa",
          display: "none",
        }}
        className="access-denied"
      >
        <div
          className="Container"
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <main
            className="access-denied-content"
            style={{
              maxWidth: "500px",
              padding: "40px",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              textAlign: "center",
              backgroundColor: "white",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🚫</div>
            <h1 style={{ color: "#dc3545", marginBottom: "20px" }}>
              Access Denied
            </h1>
            <p style={{ fontSize: "16px", color: "#6c757d", marginBottom: "30px" }}>
              {accessMessage || "You need Image Uploader or Site Assessor role to access this application."}
            </p>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>
              <p>Please contact your administrator to request access.</p>
              <p>Required roles: <strong>Image Uploader</strong> or <strong>Site Assessor</strong></p>
            </div>
            <button
              onClick={() => {
                document.querySelector("#access-denied").style.display = "none";
                document.querySelector("#login").style.display = "block";
              }}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Try Different Account
            </button>
          </main>
        </div>
      </div>
      
      <div
        id="allfeild"
        className="allfeild"
        style={{ display: isLoggedIn && hasAccess ? "block" : "none" }}
      >
        <div class="hamburger-menu">
          <input id="menu__toggle" type="checkbox" />
          <label class="menu__btn" for="menu__toggle">
            <span></span>
          </label>
          <ul class="menu__box">
            <li>
              <h1>Image Uploader</h1>
            </li>
            <li class="username">{newUser}</li>
            <li class="menu__item">{`${userstreet} ${userstate}`}</li>
            <li
              style={{
                display: "flex",
                color: "#333",
                fontFamily: "sans-serif",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
                transitionDuration: ".25s",
              }}
            >
              {usercountry}
            </li>
            {folders.map((folder, folderIndex) => (
              <li key={folder.id} className="singlefolders">
                <a
                  href={`#${folder.mainname.toLowerCase()}`}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2
                    className="folder-heading"
                    style={{ color: "black", fontSize: "1em" }}
                  >
                    {folder.mainname}
                  </h2>
                  <p style={{ fontSize: "1em" }}>{folder.imageCount}</p>
                </a>
              </li>
            ))}
            <button
              onClick={openpdf}
              style={{
                marginLeft: "25px",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "#a6a6f9",
              }}
            >
              Create PDF
            </button>
          </ul>
        </div>
        <div class="hamburger">
          <ul
            class="menu"
            style={{
              display: "flex",
              position: "fixed",
              top: "0px",
              width: "290px",
              height: "100vh",
              margin: "0px",
              listStyle: "none",
              backgroundColor: "#ECEFF1",
              flexDirection: "column",
              padding: "22px",
            }}
          >
            <li>
              <h1>Image Uploader</h1>
            </li>
            <li
              style={{
                display: "flex",
                color: "#333",
                fontFamily: "sans-serif",
                fontSize: "15px",
                fontWeight: "600",
                textDecoration: "none",
                transitionDuration: ".25s",
              }}
            >
              {newUser}
            </li>
            <li
              style={{
                display: "flex",
                color: "#333",
                fontFamily: "sans-serif",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
                transitionDuration: ".25s",
              }}
            >
              {`${userstreet} ${userstate}`}
            </li>
            <li
              style={{
                display: "flex",
                color: "#333",
                fontFamily: "sans-serif",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
                transitionDuration: ".25s",
                marginBottom: "10px",
              }}
            >
              {usercountry}
            </li>
            {folders.map((folder, folderIndex) => (
              <li
                key={folder.id}
                className="singlefolders"
                style={{ fontSize: "1em" }}
              >
                <a
                  href={`#${folder.mainname.toLowerCase()}`}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2
                    className="folder-heading"
                    style={{ color: "black", fontSize: "1em" }}
                  >
                    {folder.mainname}
                  </h2>
                  <p style={{ fontSize: "1em" }}>{folder.imageCount}</p>
                </a>
              </li>
            ))}
            <button
              onClick={openpdf}
              style={{
                marginLeft: "25px",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "#a6a6f9",
                height: "fit-Content",
                width: "160px",
              }}
            >
              Create PDF
            </button>
          </ul>
        </div>
        <div
          className="pdf"
          style={{ display: "none", width: "100vw", height: "100vh" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              width: "60%",
              height: "60%",
              position: "relative",
              transform: "translate(-50%, -50%)",
              top: "50%",
              left: "50%",
              zIndex: "9999",
              backgroundColor: "#d7d7d7",
              borderRadius: "20px",
            }}
          >
            <button
              onClick={closepdf}
              style={{
                backgroundColor: "red",
                border: "none",
                padding: "10px",
                position: "relative",
                top: "-50px",
                borderRadius: "50%",
                left: "inherit",
              }}
            >
              X
            </button>
            <h1>PDF Selections</h1>
            <label for="size" style={{ fontSize: "1.5em" }}>
              Image Size
            </label>

            <select id="size" style={{ width: "50%", height: "10%" }}>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>

            <label for="flags" style={{ fontSize: "1.5em" }}>
              Image Selection
            </label>

            <select id="flags" style={{ width: "50%", height: "10%" }}>
              <option value="All">All</option>
              <option value="Flag">Flag</option>
              <option value="No Flag">No Flag</option>
            </select>

            <label for="folder" style={{ fontSize: "1.5em" }}>
              Folder
            </label>

            <select id="folder" style={{ width: "50%", height: "10%" }}>
              <option value="All">All</option>
              <option value="Pre Install Folder">Pre Install Folder</option>
              <option value="Post Install Folder">Post Install Folder</option>
            </select>
            <button
              style={{
                marginTop: "5px",
                backgroundColor: "white",
                padding: "10px",
                border: "none",
                width: "50%",
                borderRadius: "10px",
              }}
              onClick={createdoc}
            >
              Create
            </button>
          </div>
        </div>
        <center className="main" style={{ display: "block" }}>
          <div className="usersname">
            <label htmlFor="invoiceList">Users</label>
            <input
              style={{
                width: "30%",
                height: "30px",
                borderRadius: "10px",
                marginBottom: "10px",
                marginLeft: "10px",
              }}
              list="datalistOptions"
              id="sdkfmkf"
              placeholder="Search search..."
              value={inputValue}
              onChange={(e) => {
                handleChange(e);
              }}
            />
            <datalist id="datalistOptions">
              {invoiceList.length > 0 &&
                invoiceList.map((invoice, index) => {
                  return (
                    <option
                      key={index}
                      value={invoice.title}
                      className={invoice.name}
                    >
                      {invoice.state +
                        invoice.state1 +
                        invoice.state2 +
                        invoice.state3}
                    </option>
                  );
                })}
            </datalist>
          </div>
          <div className="feildtype">
            <label htmlFor="feild">Folders</label>
            <select
              ref={fieldRef}
              onChange={callfolder}
              defaultValue={selectedFolderType}
              id="feild"
              style={{
                width: "30%",
                height: "30px",
                borderRadius: "10px",
                marginLeft: "10px",
              }}
            >
              {foldertype.map((folder, index) => (
                <option key={index} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>
          <div className="statustype">
            <label htmlFor="feild">Status</label>
            <select
              onChange={handleSelectChange1}
              id="feild"
              style={{
                width: "30%",
                height: "30px",
                borderRadius: "10px",
                marginTop: "10px",
                marginLeft: "10px",
                marginBottom: "10px",
              }}
            >
              {status.map((folder, index) => (
                <option key={index} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>
          <button
            className="addfolder"
            //  onClick={addFolder}
            style={{ display: "none" }}
          >
            Add Folder
          </button>
          {getingdata && (
            <div
              style={{
                marginTop: "200px",
              }}
            >
              Getting Folders...
            </div>
          )}
          <div
            id="image-uploader-section"
            className="folders-container"
            style={{ display: "block" }}
          >
            {loading && (
              <div className="loading-overlay">
                <p>Updating...</p>
              </div>
            )}
            {folders.map((folder, folderIndex) => (
              <div
                key={folder.id}
                id={folder.mainname.toLowerCase()}
                className="singlefolders"
              >
                <h2
                  className="folder-heading"
                  style={{ color: "black", fontSize: "1.5em" }}
                >
                  {folder.mainname}
                </h2>
                {folder.subfolders.map((subfolder, subfolderIndex) => (
                  <div
                    className={`folder ${folder.minimized ? "minimized" : ""}`}
                    key={subfolder.id}
                    onClick={(e) => {
                      if (e.target.className.includes("folder")) {
                        handleFolderClick(folder, folderIndex);
                      }
                    }}
                    style={{
                      height:
                        subfolder.images.length > 0 ||
                        shrinkStatus[`${folderIndex}-${subfolderIndex}`]
                          ? "auto"
                          : "66px",
                      backgroundColor: folder.minimized ? "white" : "white",
                      borderRadius: "10px",
                      padding: "10px",
                      boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
                      margin: "10px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="foldername">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "1em",
                        }}
                      >
                        <input
                          type="text"
                          readOnly
                          value={subfolder.name}
                          className="fixednames"
                          style={{ color: "#0039ff", fontSize: "1em" }}
                        />
                        <button
                          onClick={() =>
                            toggleShrink(folderIndex, subfolderIndex)
                          }
                          style={{
                            padding: "6px",
                            border: "none",
                            backgroundColor: "white",
                            color: "black",
                            borderRadius: "50%",
                            marginLeft: "10px",
                          }}
                        >
                          ▼
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter Description"
                        className="foldername-input"
                        value={subfolder.description || ""}
                        readOnly={
                          // Image Uploader can only ADD description (when empty), not EDIT existing
                          // Site Assessor can always edit
                          !userPermissions.can_delete && 
                          (subfolder.description && subfolder.description.trim() !== "")
                        }
                        style={{
                          backgroundColor: 
                            (!userPermissions.can_delete && 
                             (subfolder.description && subfolder.description.trim() !== ""))
                              ? "#e0e0e0" // Grey when read-only
                              : "lightblue",
                          borderRadius: "5px",
                          margin: "5px 0",
                          padding: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                          cursor: 
                            (!userPermissions.can_delete && 
                             (subfolder.description && subfolder.description.trim() !== ""))
                              ? "not-allowed"
                              : "text"
                        }}
                        onChange={(e) =>
                          handleDescriptionChange(
                            folderIndex,
                            subfolderIndex,
                            e.target.value
                          )
                        }
                        title={
                          (!userPermissions.can_delete && 
                           (subfolder.description && subfolder.description.trim() !== ""))
                            ? "Only Site Assessors can edit existing descriptions"
                            : ""
                        }
                      />
                      {subfolder.images.length === 0 && (
                        <label
                          className="custom-file-upload"
                          style={{ backgroundColor: "orange", color: "white" }}
                        >
                          <input
                            type="file"
                            id={`files-${folder.id}`}
                            name="files"
                            multiple
                            onChange={(e) =>
                              handleImageChange(
                                folderIndex,
                                subfolderIndex,
                                subfolder.name,
                                e
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          Choose files
                        </label>
                      )}
                    </div>
                    <div className="image-container">
                      {subfolder.images.map((image, imageIndex) => (
                        <div key={imageIndex} style={{ position: "relative" }}>
                          <img
                            className={`images ${image.flag ? "flagged" : ""}`}
                            src={image.src}
                            alt={image.name}
                            onClick={() => {
                              setSelectedImages(
                                folder.subfolders[subfolderIndex].images
                              );
                              setCurrentImageIndex(imageIndex);
                              setSelectedName(image.name);
                              setModalVisible(true);
                              setCurrentFolderIndex(folderIndex);
                              setCurrentSubFolderIndex(subfolderIndex);
                              setfoldername(subfolder.name);
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/File_alt_font_awesome.svg/1024px-File_alt_font_awesome.svg.png";
                            }}
                            style={{ cursor: "pointer" }}
                          />
                          <p
                            style={{
                              width: "70px",
                              overflow: "hidden",
                              height: "15px",
                              color: "purple",
                            }}
                          >
                            {image.name.split(" ").slice(0, 10).join(" ")}
                          </p>
                          <button
                            className="flag-button"
                            style={{
                              position: "absolute",
                              top: "5px",
                              left: "5px",
                              color: "white",
                              borderRadius: "5px",
                              padding: "2px 5px",
                              cursor: "pointer",
                            }}
                            onClick={(event) =>
                              toggleFlag(
                                folderIndex,
                                subfolderIndex,
                                imageIndex,
                                subfolder.name,
                                event
                              )
                            }
                          >
                            {image.flag ? (
                              <i
                                className="fa-solid fa-flag"
                                style={{ color: "#005eff" }}
                              ></i>
                            ) : (
                              <i className="fa-regular fa-flag"></i>
                            )}
                          </button>
                          {userPermissions.can_delete && !modalVisible && (
                            <label
                              className="edit-button"
                              style={{
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                                background: "rgba(0, 0, 0, 0.5)",
                                color: "white",
                                borderRadius: "5px",
                                padding: "2px 5px",
                                cursor: "pointer",
                                backgroundColor: "red",
                              }}
                              onClick={(event) =>
                                handleEditImage(
                                  folderIndex,
                                  subfolderIndex,
                                  subfolder.name,
                                  imageIndex,
                                  event
                                )
                              }
                            >
                              X
                            </label>
                          )}
                        </div>
                      ))}
                      {subfolder.images.length > 0 && (
                        <label
                          className="custom-file-upload plus-button"
                          style={{ backgroundColor: "#caccd1", color: "black" }}
                        >
                          <input
                            type="file"
                            id={`files-${folder.id}`}
                            name="files"
                            multiple
                            onChange={(e) =>
                              handleImageChange(
                                folderIndex,
                                subfolderIndex,
                                subfolder.name,
                                e
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <h1 style={{ color: "black", marginTop: "22px" }}>
                            +
                          </h1>
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {modalVisible && (
            <Modal
              images={selectedImages}
              currentImageIndex={currentImageIndex}
              onClose={closeModal}
              onNext={showNextImage}
              onPrev={showPrevImage}
              onThumbnailClick={handleThumbnailClick}
              imagename={selectedName}
              foldersname={foldername}
              toggleFlagInModal={(imageIndex, foldername, event) => {
                toggleFlag(
                  currentFolderIndex,
                  currentSubFolderIndex,
                  imageIndex,
                  foldername,
                  event
                );
              }}
            />
          )}
        </center>
      </div>
    </>
  );
}

function Modal({
  images,
  currentImageIndex,
  onClose,
  onNext,
  onPrev,
  onThumbnailClick,
  imagename,
  foldersname,
  toggleFlagInModal,
}) {
  const [localImages, setLocalImages] = useState(images);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleFlagClick = (index, event) => {
    event.stopPropagation();
    toggleFlagInModal(index, foldersname, event);
    setLocalImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages[index].flag = !updatedImages[index].flag;
      return updatedImages;
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="main-image-container">
          <button
            className="flag-button-modal"
            style={{
              color: "white",
              borderRadius: "5px",
              padding: "2px 5px",
              cursor: "pointer",
              marginTop: "10px",
              position: "absolute",
              right: "60px",
              top: "0px",
            }}
            onClick={(event) => handleFlagClick(currentImageIndex, event)}
          >
            {localImages[currentImageIndex]?.flag ? (
              <i className="fa-solid fa-flag" style={{ color: "#005eff" }}></i>
            ) : (
              <i className="fa-regular fa-flag"></i>
            )}
          </button>
          <button className="close-button" onClick={onClose}>
            X
          </button>
          <button className="nav-button prev-button" onClick={onPrev}>
            &#10094;
          </button>
          <img
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              backgroundSize: "cover",
            }}
            src={localImages[currentImageIndex]?.src}
            alt={localImages[currentImageIndex]?.name}
            className="modal-image"
          />
          <button className="nav-button next-button" onClick={onNext}>
            &#10095;
          </button>
          <p>{imagename}</p>
        </div>
        <div className="thumbnails-slider">
          {localImages.map((image, index) => (
            <div key={index}>
              <img
                src={image.src}
                alt={image.name}
                className={`thumbnail ${
                  index === currentImageIndex ? "active" : ""
                }`}
                onClick={() => onThumbnailClick(index)}
              />
              <p style={{ width: "70px", overflow: "hidden", height: "25px" }}>
                {image.name.split(" ").slice(0, 10).join(" ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
