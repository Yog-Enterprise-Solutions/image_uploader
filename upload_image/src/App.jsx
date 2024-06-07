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
  //     return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME;
  //   }
  //   return import.meta.env.VITE_SITE_NAME;
  // };

  // const frappeUrl = getSiteName();

  const siteurl = "https://yash.tranqwality.com/";
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

  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    if (storedIsLoggedIn === "true") {
      setIsLoggedIn(true);
      checkLogoutTimer();
      document.querySelector("#login").style.display = "none";
      document.querySelector(".allfeild").style.display = "block";
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
      document.querySelector(".login").style.display = "none";
      document.querySelector(".allfeild").style.display = "block";
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
        document.querySelector(".login").style.display = "block";
        document.querySelector(".allfeild").style.display = "none";
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
    var results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // Get the parameters from the URL
  let lead = getUrlParameter("lead");
  let firstName = getUrlParameter("first_name");
  useEffect(() => {
    if (lead) {
      setParentfolder(lead);
    }
  }, [lead]);

  const fieldRef = useRef(null);
  const [folderlist, setFolderList] = useState("");

  const initializeFolders = async () => {
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

      const feildname = fieldRef.current.value;
      const doc = await db.getDoc("Image Folder Tree", feildname);
      post_install_folder_list = doc.post_install_folder_list.replace(
        /\\r\\n/g,
        ""
      );
      pre_install_folder_list = doc.pre_install_folder_list.replace(
        /\\r\\n/g,
        ""
      );
      post_install_folder_list = JSON.parse(post_install_folder_list);
      pre_install_folder_list = JSON.parse(pre_install_folder_list);
      if (feildname === "Pre Install Folder List") {
        data = pre_install_folder_list;
        setFolderList("Pre Install Folder List");
      } else {
        data = post_install_folder_list;
        setFolderList("Post Install Folder List");
      }

      // console.log("Data before mapping:", data);
      // if (!Array.isArray(data)) {
      //   console.error("Data is not an array:", data);
      //   throw new Error("Data is not an array");
      // }
      console.log(data);
      const newFolders = data.map(([mainHeading, subheadings], mainIndex) => {
        const folder = {
          id: mainIndex + 1,
          mainname: mainHeading,
          minimized: false,
          subfolders: subheadings.map(
            ([subheading, value, custom_custom_description_], subIndex) => ({
              id: mainIndex * 10 + subIndex + 1,
              name: subheading,
              value: value,
              images: [],
              custom_custom_description_: custom_custom_description_,
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

  const callfolder = async () => {
    let foldlist = [];
    const feildname = fieldRef.current.value;
    setFolderList(feildname);
    console.log("callfeildname", feildname);
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
          fields: ["name", "file_name"],
          filters: [
            ["folder", "=", `Home/${parentfolder}/${feildname}`],
            ["is_folder", "=", 1],
          ],
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
              id: mainFolder.name,
              mainname: mainFolder.file_name,
              subfolders: subfolderImages,
              imageCount: totalImageCount,
            };
          })
        );

        setFolders(allSubfolders);
        setCount(1);
        console.log(allSubfolders, "all folders");
        console.log(folderlist, "folderlist");
      } else {
        initializeFolders();
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  useEffect(() => {
    if (count === 0) {
      callfolder();
    }
  }, [parentfolder, folderlist]);

  const [users, setusers] = useState([]);
  const callUser = async () => {
    try {
      const docs = await db.getDocList("Lead");
      let newUsers = [];
      for (const doc of docs) {
        const userDoc = await db.getDoc("Lead", doc.name);
        newUsers.push(userDoc.lead_name);
      }
      setusers(newUsers);
      console.log("newuser", newUsers);
      setCount(2);
    } catch (error) {
      console.error("There was an error while fetching the documents:", error);
    }
  };

  useEffect(() => {
    if (count === 1) {
      callUser();
    }
  }, [count]);

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

  const handleImageChange = (folderIndex, subfolderIndex, event) => {
    const files = Array.from(event.target.files);
    const imageObjects = files.map((file) => ({
      src: URL.createObjectURL(file),
      name: file.name,
    }));
    const updatedFolders = folders.map((folder, fIndex) => {
      if (fIndex === folderIndex) {
        const updatedSubfolders = folder.subfolders.map((subfolder, sIndex) =>
          sIndex === subfolderIndex
            ? { ...subfolder, images: [...subfolder.images, ...imageObjects] }
            : subfolder
        );
        return { ...folder, subfolders: updatedSubfolders };
      }
      return folder;
    });
    setFolders(updatedFolders);
  };

  const toggleFlag = (folderIndex, subfolderIndex, imageIndex, event) => {
    event.stopPropagation();
    const updatedFolders = folders.map((folder, fIndex) => {
      if (fIndex === folderIndex) {
        const updatedSubfolders = folder.subfolders.map((subfolder, sIndex) => {
          if (sIndex === subfolderIndex) {
            const updatedImages = subfolder.images.map((image, iIndex) => {
              if (iIndex === imageIndex) {
                const newFlagValue = !image.flag;
                console.log("New flag value:", newFlagValue);
                let flagname = newFlagValue ? 1 : 0;
                // if (flagname) {
                //   alert(`Added to flag: ${image.name}`);
                // } else {
                //   alert(`Removed from flag: ${image.name}`);
                // }
                return { ...image, flag: flagname };
              }
              return image;
            });
            return { ...subfolder, images: updatedImages };
          }
          return subfolder;
        });
        return { ...folder, subfolders: updatedSubfolders };
      }
      return folder;
    });
    setFolders(updatedFolders);
    console.log("After update:", updatedFolders);
  };

  const handleEditImage = async (
    folderIndex,
    subfolderIndex,
    imageIndex,
    event
  ) => {
    event.stopPropagation();
    const updatedFolders = folders.map((folder, fIndex) => {
      if (fIndex === folderIndex) {
        const updatedSubfolders = folder.subfolders.map((subfolder, sIndex) => {
          if (sIndex === subfolderIndex) {
            const updatedImages = subfolder.images.filter(
              (_, iIndex) => iIndex !== imageIndex
            );
            // Check if the deleted image exists in the backend
            const deletedImage = subfolder.images[imageIndex];
            if (deletedImage.id) {
              // Perform deletion in the backend
              deleteImageFromBackend(
                folder.mainname,
                subfolder.name,
                deletedImage.id
              );
            }
            return { ...subfolder, images: updatedImages };
          }
          return subfolder;
        });
        return { ...folder, subfolders: updatedSubfolders };
      }
      return folder;
    });
    setFolders(updatedFolders);
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

  const handleDescriptionChange = (
    folderIndex,
    subfolderIndex,
    custom_custom_description_
  ) => {
    setFolders((prevFolders) => {
      const updatedFolders = [...prevFolders];
      updatedFolders[folderIndex].subfolders[
        subfolderIndex
      ].custom_custom_description_ = custom_custom_description_;
      return updatedFolders;
    });
  };

  const [loading, setLoading] = useState(false);

  const createfolders = async () => {
    const feildname = fieldRef.current.value;
    console.log(feildname, "feildname");
    setLoading(true);
    try {
      let existingParentFolder = await db.getDocList("File", {
        fields: ["name"],
        filters: [
          ["folder", "=", "Home"],
          ["file_name", "=", parentfolder],
        ],
      });

      if (existingParentFolder.length === 0) {
        await db.createDoc("File", {
          file_name: parentfolder,
          is_folder: 1,
          folder: `Home`,
        });
      }

      let existingFolderlist = await db.getDocList("File", {
        fields: ["name"],
        filters: [
          ["folder", "=", `Home/${parentfolder}`],
          ["file_name", "=", feildname],
        ],
      });

      if (existingFolderlist.length === 0) {
        await db.createDoc("File", {
          file_name: feildname,
          is_folder: 1,
          folder: `Home/${parentfolder}`,
        });
      }
      for (const folder of folders) {
        try {
          const mainFolderName = folder.mainname;
          // Check if the main folder exists
          let existingMainFolder = await db.getDocList("File", {
            fields: ["name"],
            filters: [
              ["folder", "=", `Home/${parentfolder}/${feildname}`],
              ["file_name", "=", mainFolderName],
            ],
          });

          if (existingMainFolder.length === 0) {
            await db.createDoc("File", {
              file_name: mainFolderName,
              is_folder: 1,
              folder: `Home/${parentfolder}/${feildname}`,
            });
          }

          for (const subfolder of folder.subfolders) {
            try {
              const subfolderName = subfolder.name;
              const subfolderdisc = subfolder.custom_custom_description_;
              console.log("subfolder", subfolder),
                console.log("subfolderdisc", subfolderdisc);

              // Check if the subfolder exists
              let existingSubFolder = await db.getDocList("File", {
                fields: ["name"],
                filters: [
                  [
                    "folder",
                    "=",
                    `Home/${parentfolder}/${feildname}/${mainFolderName}`,
                  ],
                  ["file_name", "=", subfolderName],
                ],
              });

              console.log("existingSubFolder", existingSubFolder);
              if (existingSubFolder.length === 0) {
                await db.createDoc("File", {
                  file_name: subfolderName,
                  is_folder: 1,
                  folder: `Home/${parentfolder}/${feildname}/${mainFolderName}`,
                });
              }

              const existingImagesInSubFolder = await db.getDocList("File", {
                fields: [
                  "name",
                  "file_name",
                  "flag",
                  "custom_custom_description_",
                ],
                filters: [
                  [
                    "folder",
                    "=",
                    `Home/${parentfolder}/${feildname}/${mainFolderName}/${subfolderName}`,
                  ],
                ],
              });

              const existingImageNames = existingImagesInSubFolder.map(
                (img) => img.file_name
              );
              // Update existing images' flag
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
                isPrivate: true,
                flag: true,
                folder: `Home/${parentfolder}/${feildname}/${mainFolderName}/${subfolderName}`,
                doctype: "User",
                docname: "Administrator",
                fieldname: "image",
              };

              for (const image of images) {
                await files.uploadFile(
                  image,
                  fileArgs,
                  (completedBytes, totalBytes) =>
                    console.log(Math.round((completedBytes / totalBytes) * 100))
                );
              }
            } catch (subFolderError) {
              if (subFolderError.exc_type !== "DuplicateEntryError") {
                console.error(
                  `Error creating subfolder ${subfolder.name}:`,
                  subFolderError
                );
              }
            }
          }
        } catch (mainFolderError) {
          if (mainFolderError.exc_type !== "DuplicateEntryError") {
            console.error(
              `Error creating main folder ${folder.mainname}:`,
              mainFolderError
            );
          }
        }
      }
      setLoading(false);
      alert("All images have been uploaded successfully.");
    } catch (error) {
      console.error("Error uploading images:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading === true) {
      document.querySelector(".allfeild").style.display = "none";
    } else {
      document.querySelector(".allfeild").style.display = "block";
    }
  }, [loading]);

  const openpdf = () => {
    document.querySelector(".pdf").style.display = "block";
    document.querySelector(".main").style.display = "none";
  };
  const createdoc = () => {
    db.updateDoc("image printer", "77ca1a2b9a", {
      title: "Test",
      select: document.querySelector("#size").value,
      flag: document.querySelector("#flags").value,
      description: document.querySelector("#description").value,
      lead_ref: lead,
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

                <div className="form-check text-start my-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value="remember-me"
                    id="flexCheckDefault"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    Remember me
                  </label>
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
      {loading && <LoaderComponent />}
      <div className="allfeild" style={{ display: "none" }}>
        <div class="hamburger-menu">
          <input id="menu__toggle" type="checkbox" />
          <label class="menu__btn" for="menu__toggle">
            <span></span>
          </label>
          <ul class="menu__box">
            <li>
              <h1>Image Uploader</h1>
            </li>
            <li class="menu__item">{firstName}</li>
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
                    style={{ color: "black", fontSize: "1.5em" }}
                  >
                    {folder.mainname}
                  </h2>
                  <p style={{ fontSize: "1.5em" }}>{folder.imageCount}</p>
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
                padding: "12px 24px",
                color: "#333",
                fontFamily: "sans-serif",
                fontSize: "20px",
                fontWeight: "600",
                textDecoration: "none",
                transitionDuration: ".25s",
              }}
            >
              {firstName}
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
                    style={{ color: "black", fontSize: "1.5em" }}
                  >
                    {folder.mainname}
                  </h2>
                  <p style={{ fontSize: "1.5em" }}>{folder.imageCount}</p>
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

            <label for="description" style={{ fontSize: "1.5em" }}>
              Discription
            </label>

            <select id="description" style={{ width: "50%", height: "10%" }}>
              <option value="1">YES</option>
              <option value="0">NO</option>
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
            <label htmlFor="users"></label>
            <select
              id="users"
              style={{ width: "30%", height: "30px", borderRadius: "10px" }}
            >
              {users.map((user, index) => (
                <option key={index} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
          <div className="feildtype">
            <label htmlFor="feild"></label>
            <select
              ref={fieldRef}
              onChange={callfolder}
              id="feild"
              style={{ width: "30%", height: "30px", borderRadius: "10px" }}
            >
              <option id="" value={"Pre Install Folder List"}>
                Pre Install Folder List
              </option>
              <option
                id="Post Install Folder List"
                value={"Post Install Folder List"}
              >
                Post Install Folder List
              </option>
            </select>
          </div>
          <button
            className="addfolder"
            //  onClick={addFolder}
            style={{ display: "none" }}
          >
            Add Folder
          </button>
          <div id="image-uploader-section" className="folders-container">
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
                          style={{ color: "green" }}
                        />
                        <button
                          onClick={() =>
                            toggleShrink(folderIndex, subfolderIndex)
                          }
                          style={{
                            padding: "6px",
                            border: "none",
                            backgroundColor: "pink",
                            color: "white",
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
                        value={subfolder.custom_custom_description_}
                        style={{
                          backgroundColor: "lightblue",
                          borderRadius: "5px",
                        }}
                        onChange={(e) =>
                          handleDescriptionChange(
                            folderIndex,
                            subfolderIndex,
                            e.target.value
                          )
                        }
                      />
                      {subfolder.images.length === 0 ? (
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
                              handleImageChange(folderIndex, subfolderIndex, e)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          Choose files
                        </label>
                      ) : null}
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
                                imageIndex,
                                event
                              )
                            }
                          >
                            X
                          </label>
                        </div>
                      ))}
                      {subfolder.images.length > 0 ? (
                        <label
                          className="custom-file-upload plus-button"
                          style={{
                            backgroundColor: "lightgreen",
                            color: "black",
                          }}
                        >
                          <input
                            type="file"
                            id={`files-${folder.id}`}
                            name="files"
                            multiple
                            onChange={(e) =>
                              handleImageChange(folderIndex, subfolderIndex, e)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <h1 style={{ color: "black", marginTop: "22px" }}>
                            +
                          </h1>
                        </label>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button
              className="submitbtn"
              onClick={createfolders}
              style={{
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "10px",
                cursor: "pointer",
              }}
            >
              Submit
            </button>
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
              toggleFlagInModal={(imageIndex, event) => {
                event.stopPropagation();
                toggleFlag(
                  currentFolderIndex,
                  currentSubFolderIndex,
                  imageIndex,
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
  toggleFlagInModal,
}) {
  const [localImages, setLocalImages] = useState(images);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleFlagClick = (index, event) => {
    event.stopPropagation();
    toggleFlagInModal(index, event);
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
