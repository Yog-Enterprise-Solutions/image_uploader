import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { FrappeApp } from "frappe-js-sdk";
import imageCompression from "browser-image-compression";
import toast, { Toaster } from "react-hot-toast";
import Signin from "./components/Signin";

function App() {
  const frappeUrl = "https://erp.solarblocks.us/";
  const siteurl = frappeUrl;
  const frappe = new FrappeApp(siteurl);
  const auth = frappe.auth();
  const db = frappe.db();
  const files = frappe.file();

  const [folders, setFolders] = useState([]);
  const [statuscount, setstatuscount] = useState(0);
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
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [statusupdate, setstatusupdate] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [suggestions, setSuggestions] = useState([]);
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
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    if (storedIsLoggedIn === "true") {
      checkLogoutTimer();
      document.querySelector("#login").style.display = "none";
      document.querySelector("#allfeild").style.display = "block";
    }
  }, []);

  const startLogoutTimer = () => {
    setTimeout(() => {
      logout();
    }, 2 * 60 * 60 * 1000);
  };

  const checkLogoutTimer = () => {
    const loginTime = parseInt(localStorage.getItem("loginTime"));
    if (!isNaN(loginTime)) {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - loginTime;
      if (elapsedTime >= 2 * 60 * 60 * 1000) {
        logout();
        localStorage.setItem("isLoggedIn", "false");
        document.querySelector("#login").style.display = "block";
        document.querySelector("#allfeild").style.display = "none";
      } else {
        const remainingTime = 2 * 60 * 60 * 1000 - elapsedTime;
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
    if (localStorage.getItem("isLoggedIn") === "true") {
      setstatuscount(0);
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
          let userdetails = await db.getDoc("Lead", docs[0].file_name);
          setnewUser(userdetails.title);
          if (userdetails.street) {
            userdetails.street.length > 0
              ? setuserstreet("")
              : setuserstreet(userdetails.street);
          }

          if (userdetails.state1) {
            userdetails.state1.length > 0
              ? setuserstate("")
              : setuserstate(userdetails.state1);
          }

          if (userdetails.country1) {
            userdetails.country1.length > 0
              ? setusercountry("")
              : setusercountry(userdetails.country1);
          }
          foldlist = await db.getDocList("File", {
            fields: ["name", "file_name"],
            filters: [
              ["folder", "=", `Home/${parentfolder}`],
              ["is_folder", "=", 1],
              ["file_name", "=", feildname],
            ],
          });
        }
        if (foldlist.length > 0) {
          const mainFolders = await db.getDocList("File", {
            fields: ["name", "file_name"],
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
                fields: ["name", "file_name", "description"],
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
                    limit: 100,
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
                    discription: subFolder.description,
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
          setgetingdata(false);
        } else {
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
        setgetingdata(false);
      }
      setCount(1);
      setstatuscount(1);
      document.querySelector(".folders-container").style.display = "block";
    } else {
      console.log(username, "islogin");
    }
  };

  useEffect(() => {
    if (count === 0) {
      callfolder();
    }
  }, [parentfolder, folderlist]);
  const [orderList, setOrderList] = useState([]);
  const callUser = async () => {
    try {
      let newUsers = [];
      const docs = await db.getDocList("Lead", {
        fields: ["title", "name", "street", "city1", "state1", "country1"],
        limit: 10000,
      });

      newUsers = docs.map((doc) => ({
        title: doc.title,
        name: doc.name,
        state: doc.street || "",
        state1: doc.city1 || "",
        state2: doc.state1 || "",
        state3: doc.country1 || "",
      }));
      setInvoiceList(newUsers);
      setOrderList(newUsers);
    } catch (error) {
      toast.error("There was an error while fetching the documents", error);
    }
  };

  useEffect(() => {
    if (count === 1) {
      callUser();
    }
    ("");
  }, [count]);

  const callnewfolder = async (e) => {
    setstatuscount(0);
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
        if (userDoc.street) {
          userDoc.street.length > 0
            ? setuserstreet("")
            : setuserstreet(userDoc.street);
        }

        if (userDoc.state1) {
          userDoc.state1.length > 0
            ? setuserstate("")
            : setuserstate(userDoc.state1);
        }

        if (userDoc.country1) {
          userDoc.country1.length > 0
            ? setusercountry("")
            : setusercountry(userDoc.country1);
        }
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
            toast.error("No Folder Found");
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
                  fields: ["name", "file_name", "description"],
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
                        "description",
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
                      is_private: 0,
                    }));

                    totalImageCount += imageList.length;

                    return {
                      id: subFolder.name,
                      name: subFolder.file_name,
                      images: imageList,
                      minimized: false,
                      discription: subFolder.description,
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
          }
        } catch (error) {
          toast.error("Error fetching folders:", error);
        }
      }
    } catch (error) {
      console.error("There was an error while fetching the documents:", error);
    }
    setgetingdata(false);
    setstatuscount(1);
    document.querySelector(".folders-container").style.display = "block";
  };

  const undo = (e, description, id) => {
    const subfolderElement = document.querySelector(
      `[data-subfolder-id="${id}"]`
    );
    subfolderElement.querySelector(".submit").style.display = "none";
    subfolderElement.querySelector(".edit").style.display = "block";
    subfolderElement.querySelector(".undo").style.display = "none";
    subfolderElement.querySelector(".hidedisk").style.display = "none";
    subfolderElement.querySelector(".showdes").style.display = "block";
  };

  const changeinput = (e, description, id) => {
    const subfolderElement = document.querySelector(
      `[data-subfolder-id="${id}"]`
    );
    if (subfolderElement) {
      subfolderElement.querySelector(".submit").style.display = "block";
      subfolderElement.querySelector(".undo").style.display = "block";
      subfolderElement.querySelector(".edit").style.display = "none";
      subfolderElement.querySelector(".hidedisk").style.display = "block";
      subfolderElement.querySelector(".showdes").style.display = "none";
    } else {
      toast.error("Subfolder element not found");
    }
  };

  const descriptionchange = async (description, folder, id, name) => {
    const subfolderElement = document.querySelector(
      `[data-subfolder-id="${id}"]`
    );
    if (!subfolderElement) {
      toast.error("Subfolder element not found");
      return;
    }
    const text = subfolderElement.querySelector(".hidedisk").value;
    const formData = { description: text };

    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      credentials: "include",
    };

    if (statusupdate) {
      try {
        const response = await fetch(
          `https://erp.solarblocks.us/api/resource/File/${folder.id}/${name}`,
          requestOptions
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData._server_messages);
        }
        toast.success("Description Updated");
        subfolderElement.querySelector(".showdes").value = text;
        subfolderElement.querySelector(".submit").style.display = "none";
        subfolderElement.querySelector(".edit").style.display = "block";
        subfolderElement.querySelector(".hidedisk").style.display = "none";
        subfolderElement.querySelector(".showdes").style.display = "block";
      } catch (error) {
        // toast.error(error);
        console.log(error, "error");
      }
    } else {
      toast.error("Update status first");
    }
  };

  const [selectedstatustype, setselectedstatustype] = useState(
    "No started - Auto generated"
  );
  const submitstatus = (e) => {
    try {
      e.preventDefault();
      const form = new FormData(e.target);
      console.log(form.get("status"));
      console.log(parentfolder, "parentfolder");
      if (localStorage.getItem("isLoggedIn") === "true") {
        if (parentfolder) {
          if (folderlist === "Pre Install Folder") {
            db.updateDoc("Lead", parentfolder, {
              custom_pre_install_status: form.get("status"),
            })
              .then((doc) => {
                setstatusupdate(1);
                toast.success("Status Updated");
                localStorage.setItem("isstatusupdate", "true");
              })
              .catch((error) => console.error(error));
          } else {
            db.updateDoc("Lead", parentfolder, {
              custom_post_install_status: form.get("status"),
            })
              .then((doc) => {
                setstatusupdate(1);
                toast.success("Status Updated");
                localStorage.setItem("isstatusupdate", "true");
              })
              .catch((error) => toast.error(error));
          }
        } else {
          alert("Select User First");
        }
      } else {
        toast.error("Login First");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let userlead = parentfolder;
    let name = folderlist;
    if (statuscount === 0) {
      if (name === "Pre Install Folder") {
        db.getDoc("Lead", userlead).then((res) => {
          if (res.custom_pre_install_status === "On hold - Site Assessor") {
            setstatusupdate(0);
          }
          setselectedstatustype(res.custom_pre_install_status);
        });
      } else {
        db.getDoc("Lead", userlead).then((res) => {
          if (res.custom_pre_install_status === "On hold - Site Assessor") {
            setstatusupdate(0);
          }
          setselectedstatustype(res.custom_post_install_status);
        });
      }
    }
  }, [submitstatus]);

  const changefeild = (e) => {
    console.log(e.target.value);
    setselectedstatustype(e.target.value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setUserManuallyChanged(true);
    setSelectedOrder(value);

    if (value.trim() === "") {
      setSuggestions(orderList);
    } else {
      const filteredSuggestions = orderList.filter((order) => {
        const combinedString =
          `${order.title} ${order.state} ${order.state1} ${order.state2} ${order.state3}`.toLowerCase();
        return combinedString.includes(value.toLowerCase());
      });
      setSuggestions(filteredSuggestions);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setInputValue(suggestion.title);
    setSelectedOrder(suggestion);
    setSuggestions([]);
    const selectedInvoice = invoiceList.find(
      (invoice) => invoice.title === suggestion.title
    );
    if (selectedInvoice) {
      await callnewfolder(selectedInvoice);
    }
  };

  const showsuggestions = () => {
    setShowSuggestions(true);
    if (inputValue.trim() === "") {
      setSuggestions(orderList);
    } else {
      const filteredSuggestions = orderList.filter((order) => {
        const combinedString =
          `${order.title} ${order.state} ${order.state1} ${order.state2} ${order.state3}`.toLowerCase();
        return combinedString.includes(inputValue.toLowerCase());
      });
      setSuggestions(filteredSuggestions);
    }
  };

  const showsuggestions2 = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 500);
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

  const addFolder = () => {
    setFolders([...folders, { id: Date.now(), name: "", images: [] }]);
  };

  const handleImageChange = async (
    folderIndex,
    subfolderIndex,
    subfoldername,
    event
  ) => {
    event.stopPropagation();
    if (statusupdate) {
      setLoading(true);
      console.log(subfoldername);
      const files = Array.from(event.target.files);

      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          };
          try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
          } catch (error) {
            console.error("Error compressing image:", error);
            return file;
          }
        })
      );

      let time = Date.now();

      const imageObjects = compressedFiles.map((file) => ({
        src: URL.createObjectURL(file),
        name: `${file.name}-${time}`,
      }));
      console.log("image added", imageObjects);
      let updatedSubfolder;
      const updatedFolders = folders.map((folder, fIndex) => {
        if (fIndex === folderIndex) {
          const updatedSubfolders = folder.subfolders.map(
            (subfolder, sIndex) => {
              if (sIndex === subfolderIndex) {
                updatedSubfolder = {
                  ...subfolder,
                  images: [...subfolder.images, ...imageObjects],
                };
                return updatedSubfolder;
              }
              return subfolder;
            }
          );
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
    } else {
      toast.error("Update status first");
    }
  };

  const toggleFlag = async (
    folderIndex,
    subfolderIndex,
    imageIndex,
    subfoldername,
    event
  ) => {
    event.stopPropagation();
    if (statusupdate) {
      setLoading(true);
      const updatedFolders = folders.map((folder, fIndex) => {
        if (fIndex === folderIndex) {
          const updatedSubfolders = folder.subfolders.map(
            (subfolder, sIndex) => {
              if (sIndex === subfolderIndex) {
                if (subfolder.name === subfoldername) {
                  const updatedImages = subfolder.images.map(
                    (image, iIndex) => {
                      if (iIndex === imageIndex) {
                        const newFlagValue = !image.flag;
                        return { ...image, flag: newFlagValue };
                      }
                      return image;
                    }
                  );
                  return { ...subfolder, images: updatedImages };
                }
              }
              return subfolder;
            }
          );
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
        toast.success("Successfully Updated");
      } else {
        toast.error("Something went wrong");
      }
      setLoading(false);
    } else {
      toast.error("Update status first");
    }
  };

  const handleEditImage = async (
    folderIndex,
    subfolderIndex,
    subfoldername,
    imageIndex,
    event
  ) => {
    event.stopPropagation();
    if (statusupdate) {
      setLoading(true);
      const imageToDelete =
        folders[folderIndex].subfolders[subfolderIndex].images[imageIndex];
      const folderName = folders[folderIndex].mainname;
      const subfolderName =
        folders[folderIndex].subfolders[subfolderIndex].name;
      if (imageToDelete.id) {
        try {
          await deleteImageFromBackend(
            folderName,
            subfolderName,
            imageToDelete.id
          );
          const updatedFolders = folders.map((folder, fIndex) => {
            if (fIndex === folderIndex) {
              const updatedSubfolders = folder.subfolders.map(
                (subfolder, sIndex) => {
                  if (
                    sIndex === subfolderIndex &&
                    subfolder.name === subfoldername
                  ) {
                    const updatedImages = subfolder.images.filter(
                      (_, iIndex) => iIndex !== imageIndex
                    );
                    return { ...subfolder, images: updatedImages };
                  }
                  return subfolder;
                }
              );
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
          toast.success("Image deleted successfully.");
        } catch (error) {
          toast.error("Failed to delete image from backend.");
        }
      }

      setLoading(false);
    } else {
      toast.error("Update status first");
    }
  };
  const deleteImageFromBackend = async (
    mainFolderName,
    subFolderName,
    imageId
  ) => {
    try {
      await db.deleteDoc("File", imageId);
      return true;
    } catch (error) {
      toast.error("Error deleting image from the backend");
    }
  };

  const [loading, setLoading] = useState(false);
  const createfolders = async (folders, folderIndex, subfolderIndex) => {
    const feildname = fieldRef.current ? fieldRef.current.value : "";
    try {
      const existingImagesInSubFolder = await db.getDocList("File", {
        fields: ["name", "file_name", "flag", "description"],
        filters: [["folder", "=", `${folders.id}`]],
      });

      const existingImageNames = existingImagesInSubFolder.map(
        (img) => img.file_name
      );
      for (const existingImage of existingImagesInSubFolder) {
        const correspondingNewImage = folders.images.find(
          (img) => img.name === existingImage.file_name
        );
        if (correspondingNewImage) {
          if (existingImage.flag !== correspondingNewImage.flag) {
            await db.updateDoc("File", existingImage.name, {
              flag: correspondingNewImage.flag,
            });
          }
          correspondingNewImage.id = existingImage.name;
        }
      }

      const newImages = folders.images.filter(
        (image) => !existingImageNames.includes(image.name)
      );

      const fetchImageBlob = async (imageUrl) => {
        const response = await fetch(imageUrl);
        return await response.blob();
      };

      const blobs = await Promise.all(
        newImages.map((img) => fetchImageBlob(img.src))
      );

      let time = Date.now();
      const images = blobs.map((blob, index) => {
        const img = newImages[index];
        return new File([blob], img.name, { type: blob.type });
      });

      const fileArgs = {
        flag: true,
        folder: `${folders.id}`,
        doctype: "User",
        docname: "Administrator",
        fieldname: "image",
      };

      for (const image of images) {
        const response = await files.uploadFile(
          image,
          fileArgs,
          (completedBytes, totalBytes) =>
            console.log(Math.round((completedBytes / totalBytes) * 100))
        );
        const newImageId = response?.data?.message?.name;
        if (newImageId) {
          folders.images.forEach((img) => {
            if (img.name === image.name) {
              img.id = newImageId;
            }
          });
        }
      }
      setFolders((prevFolders) => {
        const updatedFolders = [...prevFolders];
        updatedFolders[folderIndex].subfolders[subfolderIndex] = folders;
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
  const signout = () => {
    localStorage.clear();
    location.reload();
    setIsLoggedIn(false);
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
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const auth = frappe.auth();
      await auth.loginWithUsernamePassword({ username, password });
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", new Date().getTime());
      startLogoutTimer();
      document.querySelector("#login").style.display = "none";
      document.querySelector("#allfeild").style.display = "block";
      console.log(username, "islogin");
      callUser();
    } catch (error) {
      alert("Check the details again");
    }
  };
  return (
    <>
      <Toaster />
      <Signin
        handleLogin={handleLogin}
        isLoggedIn={isLoggedIn}
        username={username}
        setUsername={setUsername}
        setPassword={setPassword}
        password={password}
      />
      <div
        id="allfeild"
        className="allfeild"
        style={{ display: isLoggedIn ? "block" : "none" }}
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
            <button
              onClick={signout}
              style={{
                marginLeft: "25px",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "rgb(249 166 166)",
                height: "fit-Content",
                width: "160px",
                marginTop: "10px",
              }}
            >
              {localStorage.getItem("isLoggedIn") ? "Sign out" : "Sign in"}
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
            <button
              onClick={signout}
              style={{
                marginLeft: "25px",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "rgb(249 166 166)",
                height: "fit-Content",
                width: "160px",
                marginTop: "10px",
              }}
            >
              {localStorage.getItem("isLoggedIn") ? "Sign out" : "Sign in"}
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
              type="search"
              id="sdkfmkf"
              placeholder="Search for Users"
              className="purorder"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={showsuggestions}
              onBlur={showsuggestions2}
            />
            {showSuggestions && (
              <ul className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div>
                      {`${suggestion.title} - ${suggestion.state}, ${suggestion.state1}, ${suggestion.state2}, ${suggestion.state3}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
            <form onSubmit={submitstatus}>
              <label htmlFor="feild" style={{ marginLeft: "86px" }}>
                Status
              </label>
              <select
                name="status"
                onChange={changefeild}
                value={selectedstatustype}
                id="feild"
                className="folderstatus"
                style={{
                  width: "30%",
                  height: "30px",
                  borderRadius: "10px",
                  margin: "10px",
                }}
              >
                {status.map((folder, index) => (
                  <option key={index} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
              <input className="statusbtn" type="submit" />
            </form>
          </div>
          <button
            className="addfolder"
            //  onClick={addFolder}
            style={{ display: "none" }}
          >
            Add Folder
          </button>
          {getingdata && inputValue.length > 0 ? (
            <div style={{ marginTop: "200px" }}>Getting Folders...</div>
          ) : (
            getingdata &&
            inputValue.length <= 0 && (
              <div style={{ marginTop: "200px" }}>No User Selected</div>
            )
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
                    data-folder-index={folderIndex}
                    data-subfolder-index={subfolderIndex}
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
                      minWidth: "95%",
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
                          style={{
                            color: "#0039ff",
                            fontSize: "1em",
                            width: "100%",
                          }}
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
                      <div
                        data-subfolder-id={subfolder.id}
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: "10px",
                          width: "100%",
                          marginBottom: "10px",
                          padding: "5px",
                          display: "flex",
                          justifyContent: "space-between",
                          position: "relative",
                        }}
                      >
                        <textarea
                          className="showdes"
                          readOnly
                          value={subfolder.discription}
                          type="text"
                          style={{
                            color: "#0039ff",
                            fontSize: "1em",
                            border: "none",
                            outline: "none",
                            display: "block",
                            minHeight: "30px",
                            width: "90%",
                          }}
                          placeholder="Description..."
                        />
                        <textarea
                          className="hidedisk"
                          type="text"
                          style={{
                            color: "#0039ff",
                            fontSize: "1em",
                            border: "none",
                            outline: "none",
                            display: "none",
                            minHeight: "30px",
                            width: "90%",
                          }}
                          placeholder="Description..."
                          defaultValue={subfolder.discription}
                        />
                        <button
                          className="edit"
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            color: "red",
                            display: "block",
                            position: "absolute",
                            right: "10px",
                          }}
                          onClick={(e) =>
                            changeinput(e, subfolder.discription, subfolder.id)
                          }
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          className="submit"
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            color: "red",
                            display: "none",
                            position: "absolute",
                            right: "40px",
                            top: "3px",
                          }}
                          onClick={() =>
                            descriptionchange(
                              subfolder.description,
                              folder,
                              subfolder.id,
                              subfolder.name
                            )
                          }
                        >
                          <i
                            className="fa-solid fa-check"
                            style={{ color: "#63E6BE" }}
                          ></i>
                        </button>
                        <button
                          className="undo"
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            color: "red",
                            display: "none",
                            position: "absolute",
                            right: "10px",
                          }}
                          onClick={(e) => {
                            undo(e, subfolder.discription, subfolder.id);
                          }}
                        >
                          <i
                            class="fa-solid fa-xmark"
                            style={{ color: "red" }}
                          ></i>
                        </button>
                      </div>

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

  // const downloadimg = (currentImageIndex, event) => {
  //   event.stopPropagation();

  //   const imageSrc = localImages[currentImageIndex]?.src;
  //   const imageName =
  //     localImages[currentImageIndex]?.name || "downloaded_image";
  //   if (imageSrc && imageName.includes("png")) {
  //     const img = new Image();
  //     img.crossOrigin = "anonymous";
  //     img.src = imageSrc;

  //     img.onload = () => {
  //       const canvas = document.createElement("canvas");
  //       canvas.width = img.width;
  //       canvas.height = img.height;
  //       const ctx = canvas.getContext("2d");
  //       ctx.drawImage(img, 0, 0);
  //       const pngDataUrl = canvas.toDataURL("image/png");
  //       const link = document.createElement("a");
  //       link.href = pngDataUrl;
  //       link.download = `${imageName}.png`;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     };

  //     img.onerror = (err) => {
  //       console.error("Error loading the image", err);
  //     };
  //   } else {
  //     may be its a file not a image
  //     so whatever it is just download it
  //   }
  // };

  const downloadimg = (currentImageIndex, event) => {
    event.stopPropagation();

    const imageSrc = localImages[currentImageIndex]?.src;
    const imageName =
      localImages[currentImageIndex]?.name || "downloaded_image";

    // Check if the image source exists
    if (imageSrc) {
      // Check if the source is a PNG image
      if (imageName.includes("png")) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngDataUrl;
          link.download = `${imageName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        img.onerror = (err) => {
          console.error("Error loading the image", err);
        };
      } else {
        // It's not a PNG image, download it as is
        const link = document.createElement("a");
        link.href = imageSrc; // Use the imageSrc directly
        link.download = imageName; // Set the name for the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      console.error("Image source is not available.");
    }
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
              right: "110px",
              top: "0px",
            }}
            onClick={(event) => downloadimg(currentImageIndex, event)}
          >
            <i class="fa-solid fa-download"></i>
          </button>
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
              maxWidth: "800px",
              maxHeight: "400px",
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
