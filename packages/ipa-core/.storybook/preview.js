import React from "react";
import { StyledEngineProvider, ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "../src/IpaStyles/theme.scss";
import "../src/IpaIcons/icons.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/stories/assets/icons.scss";
import "../src/stories/assets/variables.scss";

const theme = createTheme({
    palette: {
        mode: "light",
        buttonDefault: {
            main: '#E0E0E0'
        },
        tabDefault: {
            main: '#000000DE'
        },
    },
});

export const decorators = [
    (Story) => (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Story />
            </ThemeProvider>
        </StyledEngineProvider>
    ),
];
