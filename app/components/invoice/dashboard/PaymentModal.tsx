import { Modal, Box, Typography, List, ListItem, ListItemText, Checkbox, Button } from "@mui/material";
import {  useEffect } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPayment: number; // Accept the current payment amount
  receipt: boolean; // Prop to handle the receipt state
  serviceDetails: { serviceName: string; price: number }[]; // Service details to display
  onReceiptChange: (value: boolean) => void; // Function prop for receipt change
  onSubmit: () => void; // Confirm payment
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentPayment,
  receipt,
  serviceDetails,
  onReceiptChange,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(); // Confirm the payment
    onClose(); // Close the modal after submitting
  };

  useEffect(() => {
    // Optional: Reset the modal state when it opens
  }, [isOpen]);

  const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
   
    boxShadow: 24,
    maxHeight: "80vh", // Limit the height of the modal
    overflowY: "auto", // Enable vertical scrolling
    p: 4,
    borderRadius: 2,
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Confirm Payment
        </Typography>
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Service Details
          </Typography>
          <List>
            {serviceDetails.map((service, index) => (
              <ListItem key={index}>
                <ListItemText primary={service.serviceName} secondary={`${service.price.toFixed(2)}`} />
              </ListItem>
            ))}
          </List>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Typography variant="body1" gutterBottom>
              Current Payment Amount: {currentPayment.toFixed(2)}
            </Typography>
          </div>
          <div className="mb-4">
            <Checkbox
              checked={receipt}
              onChange={(e) => onReceiptChange(e.target.checked)}
              inputProps={{ "aria-label": "primary checkbox" }}
            />
            <Typography variant="body1" gutterBottom>
              {" "}
             R
            </Typography>
          </div>
          <div className="flex justify-end">
            <Button variant="outlined" onClick={onClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Confirm
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default PaymentModal;