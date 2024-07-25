import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { FrappeApp } from "frappe-js-sdk";
import LoaderComponent from "./Loader";

function App() {
  // const getSiteName = () => {
  //   if (
  //     window.frappe?.boot?.versions?.frappe &&
  //     (window.frappe.boot.versions.frappe.startsWith("15") ||
  //       window.frappe.boot.versions.frappe.startsWith("16"))
  //   ) {
  //     console.log(import.meta.env.VITE_SITE_NAME);
  //     return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME;
  //   }
  //   return import.meta.env.VITE_SITE_NAME;
  // };

  // const frappeUrl = "https://yash.tranqwality.com/";
  const frappeUrl = "https://erp.solarblocks.us/";

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
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    if (storedIsLoggedIn === "true") {
      setIsLoggedIn(true);
      checkLogoutTimer();
      document.querySelector("#login").style.display = "none";
      document.querySelector("#allfeild").style.display = "block";
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const auth = frappe.auth();
      await auth.loginWithUsernamePassword({ username, password });

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", new Date().getTime());
      setIsLoggedIn(true);
      startLogoutTimer();
      document.querySelector("#login").style.display = "none";
      document.querySelector("#allfeild").style.display = "block";
    } catch (error) {
      console.error("Login failed:", error);
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
    console.log("callfolder run");
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
              fields: ["name", "file_name", "custom_custom_description_"],
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
        setgetingdata(false);
      } else {
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      setgetingdata(false);
    }
    setCount(1);
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

  const fetchmydata = async (e) => {
    try {
      let newUsers = [];
      const docs = await db
        .getDocList("Lead", {
          fields: ["title", "name", "street", "city1", "state1", "country1"],
          limit: 10000,
        })
        .then((response) => response.json())
        .then((json) => {
          const filterdata = json.filter((user) => {
            return user && user.title && user.title.toLowerCase().includes(e);
          });
          setInvoiceList(filterdata);
        });
    } catch (error) {
      console.error("There was an error while fetching the documents:", error);
    }
  };

  // useEffect(() => {
  //   if (count === 1) {
  //     callUser();
  //   }
  //   ("");
  // }, [count]);

  const callnewfolder = async (e) => {
    console.log("callnewwfolder run");
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
            alert("No Folder Found");
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
                  fields: ["name", "file_name", "custom_custom_description_"],
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
                        "custom_custom_description_",
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

  const handelchange = async (e) => {
    setInputValue(e);
    await fetchmydata(e);
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
  const onfocus = (e) => {
    callUser();
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
    setLoading(true);
    console.log(subfoldername);
    const files = Array.from(event.target.files);
    const imageObjects = files.map((file) => ({
      src: URL.createObjectURL(file),
      name: file.name,
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

  const createfolders = async (folders, folderIndex, subfolderIndex) => {
    const feildname = fieldRef.current ? fieldRef.current.value : "";
    console.log(feildname, "feildname");
    console.log(folders, "this is tyhe ashdasjkiuf");
    try {
      const existingImagesInSubFolder = await db.getDocList("File", {
        fields: ["name", "file_name", "flag", "custom_custom_description_"],
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
          // Assign the existing image ID to the new image object
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
        console.log(response.data.message.name);
        const newImageId = response?.data?.message?.name;
        if (newImageId) {
          folders.images.forEach((img) => {
            if (img.name === image.name) {
              img.id = newImageId;
            }
          });
        }
      }

      // Update the state with new image IDs
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
          id="login"
          style={{
            backgroundColor: "#f8f9fa",
            display: "block",
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
      </div>
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
            className="searchbar"
            placeholder="Search search..."
            value={inputValue}
            // onChange={(e) => {
            //   handleChange(e);
            // }}
            onChange={(e) => handelchange(e.target.value)}
            onFocus={(e) => onfocus(e.target.value)}
            onBlur={(e) => handelchange(e.target.value)}
          />
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
