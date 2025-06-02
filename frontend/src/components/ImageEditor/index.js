import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  makeStyles,
} from '@material-ui/core';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 800,
  },
  editorContainer: {
    position: 'relative',
    width: '100%',
    height: 600,
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cropContainer: {
    maxHeight: 600,
    maxWidth: '100%',
    overflow: 'hidden',
  },
}));

const ImageEditor = ({ open, onClose, image, onSave }) => {
  const classes = useStyles();
  const cropperRef = useRef(null);

  const handleSave = () => {
    if (cropperRef.current?.cropper) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      const croppedImage = croppedCanvas.toDataURL();
      onSave(croppedImage);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        style: {
          maxWidth: '90vw',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>Recortar Imagem</DialogTitle>
      <DialogContent>
        <div className={classes.editorContainer}>
          {image && (
            <div className={classes.cropContainer}>
              <Cropper
                ref={cropperRef}
                src={image}
                style={{ height: 500, width: '100%' }}
                guides={true}
                viewMode={2}
                dragMode="crop"
                autoCropArea={0.6}
                background={true}
                responsive={true}
                checkOrientation={false}
                cropBoxMovable={true}
                cropBoxResizable={true}
                toggleDragModeOnDblclick={true}
                minCropBoxWidth={10}
                minCropBoxHeight={10}
              />
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          color="primary" 
          variant="contained"
        >
          Recortar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageEditor; 