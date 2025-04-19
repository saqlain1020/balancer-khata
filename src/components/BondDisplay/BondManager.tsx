import React, { useState } from "react";
import { Person } from "../../types/bonds";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import BondDisplay from "./index";
import BondChips from "./BondChips";
import AddEditBondForm from "./AddEditBondForm";

interface BondManagerProps {
  initialPeople?: Person[];
  displayMode: "text" | "chips";
  onDataChange?: (people: Person[]) => void;
}

const BondManager: React.FC<BondManagerProps> = ({ initialPeople = [], displayMode, onDataChange }) => {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);
  const [editPerson, setEditPerson] = useState<Person | null>(null);

  const handleAddPerson = (newPerson: Person) => {
    const updatedPeople = [...people, newPerson];
    setPeople(updatedPeople);
    if (onDataChange) {
      onDataChange(updatedPeople);
    }
  };

  const handleEditPerson = (updatedPerson: Person) => {
    const updatedPeople = people.map((person) => (person.id === updatedPerson.id ? updatedPerson : person));
    setPeople(updatedPeople);
    setEditPerson(null);
    if (onDataChange) {
      onDataChange(updatedPeople);
    }
  };

  const openDeleteDialog = (personId: string) => {
    setPersonToDelete(personId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPersonToDelete(null);
  };

  const confirmDelete = () => {
    if (personToDelete) {
      const updatedPeople = people.filter((person) => person.id !== personToDelete);
      setPeople(updatedPeople);
      if (onDataChange) {
        onDataChange(updatedPeople);
      }
      closeDeleteDialog();
    }
  };

  const handleEditClick = (person: Person) => {
    setEditPerson({ ...person });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Manage Bond Data
        </Typography>

        <AddEditBondForm onSave={handleAddPerson} />
      </Box>

      {people.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "rgba(40,40,40,0.3)" }}>
          <Typography variant="body1" color="text.secondary">
            No bond data available. Add your first person using the button above.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Action buttons for each person */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              People
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {people.map((person) => (
                <Paper
                  key={person.id}
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "background.paper",
                  }}
                >
                  <Box>
                    <Typography fontWeight={500}>{person.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {person.categories.length} categories,
                      {person.categories.reduce((acc, cat) => acc + cat.bonds.length, 0)} bonds
                    </Typography>
                  </Box>

                  <Box>
                    <IconButton color="primary" onClick={() => handleEditClick(person)} title="Edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => openDeleteDialog(person.id)} title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Bond display */}
          {displayMode === "text" ? <BondDisplay people={people} /> : <BondChips people={people} />}
        </>
      )}

      {/* Edit form */}
      {editPerson && <AddEditBondForm onSave={handleEditPerson} editPerson={editPerson} />}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this person and all their bond data? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BondManager;
