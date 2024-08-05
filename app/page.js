"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { firestore } from "../firebase";
import debounce from "lodash/debounce";
import { CiSearch } from "react-icons/ci";
import {
  Box,
  Stack,
  Typography,
  Modal,
  TextField,
  Button,
  Container,
} from "@mui/material";
import {
  collection,
  query,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function Home() {
  // products = state, setProducts = function to update state
  const [inventory, setInventory] = useState([]);

  // open = modal open or not, setOpen = function to update modal
  const [open, setOpen] = useState(false);

  // itemName = name of each item, setItemName = function to update item name
  const [itemName, setItemName] = useState("");

  const [addingItemName, setAddingItemName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [addingError, setAddingError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // update firebase
  const updateInventory = async () => {
    setLoading(true);
    // snapshot of collection
    const snapshot = query(collection(firestore, "inventory"));

    // get all documents in collection
    const products = await getDocs(snapshot);

    const inventoryList = [];

    // loop through all documents and add to inventoryList
    products.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setLoading(false);
  };

  //   remove item
  const removeItem = async (item) => {
    item = item.trim().replace(/\s+/g, " ").toLowerCase();
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  //   add item
  const addItem = async (item) => {
    item = item.trim().replace(/\s+/g, " ").toLowerCase();
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, {
        quantity: quantity + 1,
      });
    } else {
      await setDoc(docRef, {
        quantity: 1,
      });
    }

    // clear the itemName
    setItemName("");

    // run the search function
    await debouncedSearch(searchTerm);
  };

  //   search item
  const searchItem = async (item) => {
    // item = item.trim().replace(/\s+/g, " ").toLowerCase();

    // get data from firestore
    const snapshot = query(collection(firestore, "inventory"));

    // get all documents in collection
    const products = await getDocs(snapshot);

    const inventoryList = [];

    // loop through all documents and add to inventoryList
    products.forEach((doc) => {
      // if doc contains item
      if (doc.id.includes(item)) {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      }
    });
    console.log(inventoryList);
    setInventory(inventoryList);
  };

  const debouncedSearch = useCallback(
    debounce(async (term) => {
      await searchItem(term);
    }, 300),
    []
  );

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleOpen = () => {
    setOpen(true);
    setAddingItemName("");
  };

  const handleClose = () => {
    setOpen(false);
    setAddingItemName("");
  };

  useEffect(() => {
    updateInventory();
  }, []); // run only once because of empty array

  return (
    <Container maxWidth="md">
      <Box
        width="100%"
        display="flex"
        flexDirection={"column"}
        justifyContent="center"
        alignItems="center"
        gap={2}
        p={2}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{ transform: "translate(-50%, -50%)" }}
          >
            <Typography variant="h3">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={addingItemName}
                onChange={(e) => {
                  setAddingItemName(e.target.value);
                  setAddingError(false);
                }}
                error={addingError}
                placeholder={addingError ? "Please enter item name" : ""}
                sx={{
                  borderColor: addingError ? "red" : "inherit",
                }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  // if item name is empty
                  if (addingItemName.trim() === "") {
                    setAddingError(true);
                    return;
                  }
                  addItem(addingItemName);
                  setAddingItemName("");
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* <Box>
			<Typography>Inventory</Typography>
		</Box> */}
        <Box
          width="100%"
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          p={2}
        >
          <Button variant="contained" onClick={() => handleOpen()}>
            Add new Item
          </Button>
          {/* search functionality */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            {/* search icon */}
            <CiSearch
              sx={{
                color: "action.active",
                my: 0.5,
                mr: 0.5,
                opacity: 0.5,
                transition: (theme) => theme.transitions.create("opacity"),
                "&:hover": { opacity: 0.8 },
                fontSize: 20,
              }}
            />
            <TextField
              variant="standard"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setError(false);
              }}
              error={error}
              placeholder={error ? "Please enter item name" : ""}
              sx={{ borderColor: error ? "red" : "inherit" }}
            />
          </Box>
        </Box>

        <Box border="1px solid #333">
          <Box
            width="800px"
            height="100px"
            bgcolor="#ADD8E6"
            display="flex"
            alignItems="center"
            justifyContent={"center"}
          >
            <Typography variant="h3" color="#333">
              Inventory Items
            </Typography>
          </Box>
          <Stack width="800px" height="300px" spacing={2} overflow="auto">
            {loading ? (
              <Box>
                <Typography variant="h6" color="#333" align="center" p={2}>
                  Loading...
                </Typography>
              </Box>
            ) : inventory.length === 0 ? (
              <Box>
                <Typography variant="h6" color="#333" align="center" p={2}>
                  No items found
                </Typography>
              </Box>
            ) : (
              inventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  minHeight="150px"
                  width="100%"
                  bgcolor="#f0f0f0"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  padding={5}
                >
                  <Typography variant="h3" color="#333" textAlign="center">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h3" color="#333" textAlign="center">
                    {quantity}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={() => addItem(name)}>
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => removeItem(name)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
