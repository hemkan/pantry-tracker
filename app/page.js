"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { Box, Typography } from "@mui/material";
import { collection, query } from "firebase/firestore";
import { getDocs } from "firebase/firestore";

export default function Home() {
  // products = state, setProducts = function to update state
  const [inventory, setInventory] = useState([]);

  // open = modal open or not, setOpen = function to update modal
  const [open, setOpen] = useState(false);

  // itemName = name of each item, setItemName = function to update item name
  const [itemName, setItemName] = useState("");

  // update firebase
  const updateInventory = async (id, quantity) => {
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
  };

  //   remove item
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory", item));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, {
          quantity: quantity - 1,
        });
      }
    }
    await updateInventory();
  };

  //   add item
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory", item));
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
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    updateInventory();
  }, []); // run only once because of empty array

  return (
    // Box = div
    <Box>
      {/* Typography = content */}
      <Typography variant="h1">Inventory Management</Typography>
      {inventory.forEach((item) => {
        console.log(item);
        return (
          <Box>
            <Typography>{item.name}</Typography>
            <Typography>{item.quantity}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}
