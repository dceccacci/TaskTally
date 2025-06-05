'use client'
import { Box, Button, Typography } from "@mui/material";
import NavBar from "./components/navBar";
import { useUserContext } from "@/context/userContext";
import CategoryTable from "./components/categoryTable";

export default function Home() {
  const {categories} = useUserContext();
  return (
    <Box>
      <NavBar/>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5, mb: 5, mr: 10 }}>
          <Button variant="contained">
            Add Task
          </Button>
        </Box>
      {categories && categories.map((category, idx) => (
        <Box key={idx}>
          <Typography variant="h6" sx={{ ml: 2, mb: 1 }}>
              {category.name}
            </Typography>
          <Box  sx={{ mb: 4, border: "1px solid #ccc", borderRadius: 2, px:3, py:2, mx:2, backgorundColor: "#fafafa"}}>
            <CategoryTable category={category} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
