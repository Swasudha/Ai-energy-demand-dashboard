import { Box } from "@mui/material";

import Sidebar, { drawerWidth } from "./Sidebar";
import Header from "./Header";

function MainLayout({ children }) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: "100%",
            md: `calc(100% - ${drawerWidth}px)`,
          },
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <Header />

        <Box
          sx={{
            pt: {
              xs: 9,
              sm: 10,
              md: 11,
            },

            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },

            pb: {
              xs: 2,
              md: 4,
            },

            maxWidth: "1800px",
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;