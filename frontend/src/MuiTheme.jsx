import { createTheme } from "@mui/material";

export const MuiTheme = createTheme({
    palette: {
        DataGrid: {
            headerBg: '#4354b3',
            border: '1'
        }
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiDataGrid: {
            styleOverrides: {
                columnHeaderTitle: {
                    color: 'white',
                },
                cell: {
                    border: '1px solid grey'
                },
            }
        },
    }
});