'use client'
import Link from "next/link"
import { AppBar, Toolbar, Typography,  Container, Box, Avatar, Button, Tooltip, IconButton, Menu, MenuItem } from '@mui/material'
import { useUserContext, logOut, googleSignIn } from "@/context/userContext";
import { useState } from "react";

/*

Should have a link back to "/"

Should have a conditional render:
  If the user is not logged in, show a login button
  else
  if the user is logged in, show a mini icon of the user's profile picture, a link to /profile and a logout button.

NavBar buttons do the following:
  Call login with google function from the context provider on the login button
  Call logout function from the context provider on the logout button
*/


export default function NavBar() {
  const {user} = useUserContext();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  function handleLogout(){
    logOut();
  }

  function handleGoogleLogin(){
    googleSignIn();
    handleCloseUserMenu
  }
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };


  return (
    <AppBar position="static">
        <Toolbar disableGutters sx={{ px: 2 }}>
          <Link href="/" style={{color: "#fff", textDecoration: 'none'}}>
            <Typography
                variant="h5"
                noWrap
                sx={{
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                }}
            >
                HOME
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Typography
              variant="h4"
              noWrap
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: "#fff",
              }}
            >
              Task Tally
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            <Link href="/categories" style={{color: "#fff", textDecoration: 'none'}}>
              <Typography
                noWrap
                sx={{
                  mr: 2,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                }}
              >
                Categories
              </Typography>
            </Link>
            <Link href="/stats" style={{color: "#fff", textDecoration: 'none'}}>
              <Typography
                noWrap
                sx={{
                  mr: 2,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                }}
              >
                Stats
              </Typography>
            </Link>
            </Box>
            <Box sx={{ flexGrow: 0, ml: "auto" }}>
            {user ? (
              <Box>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      src={user.photoURL || ""}
                      alt={user.displayName || "Profile"}
                      sx={{ width: 46, height: 46, mr: 2, cursor: "pointer" }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box>
                <Tooltip title="Sign In">
                  <IconButton onClick={handleGoogleLogin} sx={{ p: 0 }}>
                    <Avatar
                      src={"/avatar-default-icon.png"}
                      alt={"Sign-In"}
                      sx={{ width: 46, height: 46, mr: 2, cursor: "pointer" }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Toolbar>
    </AppBar>
  );
}