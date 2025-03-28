import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { addAllowedUser, deleteAllowedUser, getAllowedUsers } from "src/app/actions/users";
import CircleIcon from "@mui/icons-material/Circle";
import { Delete } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";

export default async function Page() {
  const users = await getAllowedUsers();
  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="h5" fontWeight={"bold"}>
        Allowed Users
      </Typography>
      <List sx={{ maxWidth: 500, mb: 2 }}>
        {users.map((user, i) => (
          <ListItem key={i} secondaryAction={<DeleteUser email={user.email} />}>
            <ListItemIcon>
              <CircleIcon sx={{ height: 10, width: 10, color: "black" }} />
            </ListItemIcon>
            <ListItemText primary={user.email} />
          </ListItem>
        ))}
      </List>
      <SaveUsers />
    </Box>
  );
}

function DeleteUser({ email }: { email: string }) {
  return (
    <form action={deleteAllowedUser}>
      <input value={email} hidden name="email" />
      <IconButton type="submit">
        <Delete />
      </IconButton>
    </form>
  );
}

function SaveUsers() {
  return (
    <form action={addAllowedUser}>
      <TextField
        fullWidth
        name="email"
        label="Enter Email"
        type="email"
        InputProps={{
          endAdornment: (
            <IconButton color="primary" type="submit">
              <SendIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </form>
  );
}
