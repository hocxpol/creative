import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  makeStyles,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Box,
  Tooltip,
  LinearProgress,
  Chip,
  TextField,
  ListItemIcon,
} from '@material-ui/core';
import { 
  Delete, 
  CloudUpload, 
  InsertDriveFile, 
  Image, 
  VideoLibrary, 
  Audiotrack,
  PictureAsPdf,
  Description,
  ClearAll,
  Edit,
  DragIndicator,
  AttachFile,
} from '@material-ui/icons';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { i18n } from '../../translate/i18n';
import ImageEditor from '../ImageEditor';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: '95vw',
    height: '95vh',
    margin: 0,
  },
  dropzone: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.dark,
    },
    '&.active': {
      borderColor: theme.palette.primary.dark,
      backgroundColor: theme.palette.action.selected,
    }
  },
  fileList: {
    height: 'calc(95vh - 340px)',
    overflow: 'auto',
    padding: theme.spacing(0.5),
    paddingBottom: theme.spacing(4),
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '& .MuiIconButton-root': {
      padding: 4,
      marginLeft: theme.spacing(1),
    },
    '& .MuiListItemSecondaryAction-root': {
      right: 4,
    }
  },
  orderNumber: {
    minWidth: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(1),
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  dragHandle: {
    cursor: 'grab',
    color: theme.palette.text.secondary,
    '&:active': {
      cursor: 'grabbing',
    },
  },
  uploadIcon: {
    fontSize: 36,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(0.5),
  },
  fileIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
    }
  },
  fileName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '180px',
    marginRight: theme.spacing(1),
  },
  fileSize: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
    minWidth: 70,
    textAlign: 'right',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    paddingRight: 0,
    minWidth: 0,
  },
  fileDetails: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(2),
  },
  descriptionField: {
    minWidth: 120,
    flex: 1,
    marginRight: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.paper,
      paddingRight: 0,
    }
  },
  errorText: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(0.5),
    fontSize: '0.75rem',
  },
  dialogContent: {
    padding: theme.spacing(2),
  },
  dialogTitle: {
    padding: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(1, 2),
  },
  btnWrapper: {
    marginLeft: theme.spacing(1),
  },
  previewImage: {
    width: 48,
    height: 48,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(1),
  },
  totalSize: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 'auto',
  },
  progress: {
    marginTop: theme.spacing(1),
    position: 'sticky',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 2,
    background: theme.palette.background.paper,
  }
}));

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
const MAX_FILES = 10;

const getFileIcon = (file) => {
  if (file.type.startsWith('image/')) return <Image />;
  if (file.type.startsWith('video/')) return <VideoLibrary />;
  if (file.type.startsWith('audio/')) return <Audiotrack />;
  if (file.type === 'application/pdf') return <PictureAsPdf />;
  if (file.type.includes('word') || file.type.includes('excel') || file.type === 'text/plain') return <Description />;
  return <InsertDriveFile />;
};

const FileUploadModal = ({ open, onClose, onUpload, initialFiles }) => {
  const classes = useStyles();
  const [files, setFiles] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingImage, setEditingImage] = useState(null);
  const [editingImageIndex, setEditingImageIndex] = useState(null);

  useEffect(() => {
    if (initialFiles) {
      setFiles(initialFiles);
      // Inicializa as descrições com o nome do arquivo
      const initialDescriptions = {};
      initialFiles.forEach((file, index) => {
        initialDescriptions[index] = file.description || file.name;
      });
      setDescriptions(initialDescriptions);
    }
  }, [initialFiles]);

  const onDrop = useCallback((acceptedFiles) => {
    if (files.length + acceptedFiles.length > MAX_FILES) {
      setError(i18n.t('fileUploadModal.errors.maxFilesExceeded', { max: MAX_FILES }));
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(i18n.t('fileUploadModal.errors.sizeExceeded'));
        return false;
      }
      
      // Validar nome do arquivo
      const invalidChars = /[<>:"/\\|?*]/;
      if (invalidChars.test(file.name)) {
        setError(i18n.t('fileUploadModal.errors.invalidFileName'));
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setError('');
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setDescriptions(prev => {
      const newDescriptions = { ...prev };
      delete newDescriptions[index];
      return newDescriptions;
    });
  };

  const handleClearAll = () => {
    setFiles([]);
    setDescriptions({});
    setError('');
  };

  const handleDescriptionChange = (index, value) => {
    setDescriptions(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simular progresso de upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const filesWithDescriptions = files.map((file, index) => ({
        file,
        description: descriptions[index] || file.name
      }));
      
      await onUpload(filesWithDescriptions);
      setFiles([]);
      setDescriptions({});
      onClose();
    } catch (err) {
      setError(i18n.t('fileUploadModal.errors.uploadFailed'));
    } finally {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return files.reduce((acc, file) => acc + file.size, 0);
  };

  const handleEditImage = (file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingImage(e.target.result);
      setEditingImageIndex(index);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditedImage = (croppedImage) => {
    // Converter base64 para Blob
    fetch(croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], files[editingImageIndex].name, {
          type: files[editingImageIndex].type
        });
        
        const newFiles = [...files];
        newFiles[editingImageIndex] = file;
        setFiles(newFiles);
        setEditingImage(null);
        setEditingImageIndex(null);
      });
  };

  const renderFilePreview = (file, index) => {
    if (file.type.startsWith('image/')) {
      return (
        <Box 
          onClick={() => handleEditImage(file, index)}
          style={{ cursor: 'pointer' }}
          title={i18n.t('fileUploadModal.editImage')}
        >
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className={classes.previewImage}
          />
        </Box>
      );
    }
    return (
      <Box className={classes.fileIcon}>
        {getFileIcon(file)}
      </Box>
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Reordenar as descrições junto com os arquivos
    const newDescriptions = {};
    items.forEach((_, index) => {
      const oldIndex = files.findIndex(file => file === items[index]);
      if (oldIndex !== -1 && descriptions[oldIndex] !== undefined) {
        newDescriptions[index] = descriptions[oldIndex];
      }
    });

    setFiles(items);
    setDescriptions(newDescriptions);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={false}
      fullWidth 
      classes={{ paper: classes.root }}
      PaperProps={{
        style: {
          margin: '2.5vh auto',
        }
      }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {i18n.t('fileUploadModal.title')}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <div {...getRootProps()} className={`${classes.dropzone} ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <CloudUpload className={classes.uploadIcon} />
          <Typography variant="subtitle1">
            {isDragActive
              ? i18n.t('fileUploadModal.dragAndDrop')
              : i18n.t('fileUploadModal.dragAndDrop')}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {i18n.t('fileUploadModal.selectFiles')}
          </Typography>
        </div>

        {error && (
          <Typography className={classes.errorText} variant="body2">
            {error}
          </Typography>
        )}

        {files.length > 0 && (
          <>
            <Box className={classes.totalSize}>
              <Typography variant="caption" color="textSecondary">
                {i18n.t('fileUploadModal.totalSize')}: {formatFileSize(getTotalSize())}
              </Typography>
              <Button
                size="small"
                startIcon={<ClearAll />}
                onClick={handleClearAll}
                className={classes.clearButton}
              >
                {i18n.t('fileUploadModal.clearAll')}
              </Button>
            </Box>

            <Paper className={classes.fileList} elevation={0}>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="files">
                  {(provided) => (
                    <List
                      dense
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {files.map((file, index) => (
                        <Draggable
                          key={index}
                          draggableId={`file-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={classes.fileItem}
                              dense
                              disableGutters
                            >
                              <Box className={classes.orderNumber}>{index + 1}</Box>
                              <Box {...provided.dragHandleProps} className={classes.dragHandle}>
                                <DragIndicator />
                              </Box>
                              {renderFilePreview(file, index)}
                              <Box className={classes.fileInfo}>
                                <Box className={classes.fileDetails}>
                                  <Typography className={classes.fileName} title={file.name}>
                                    {file.name}
                                  </Typography>
                                  <Typography className={classes.fileSize}>
                                    {formatFileSize(file.size)}
                                  </Typography>
                                  <TextField
                                    size="small"
                                    placeholder={i18n.t('fileUploadModal.descriptionPlaceholder')}
                                    value={descriptions[index] || ''}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    margin="dense"
                                    variant="outlined"
                                    className={classes.descriptionField}
                                    inputProps={{
                                      maxLength: 1024
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Box display="flex" alignItems="center" ml={1}>
                                {file.type.startsWith('image/') && (
                                  <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => handleEditImage(file, index)}
                                    style={{ marginRight: 4 }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                )}
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            </Paper>
          </>
        )}

        {uploading && (
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            className={classes.progress}
          />
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={onClose}
          color="secondary"
          disabled={uploading}
          variant="outlined"
        >
          {i18n.t("fileUploadModal.cancel")}
        </Button>
        <Button
          onClick={handleUpload}
          color="primary"
          variant="contained"
          disabled={files.length === 0 || uploading}
          className={classes.btnWrapper}
        >
          {i18n.t("fileUploadModal.send")}
        </Button>
      </DialogActions>

      <ImageEditor
        open={!!editingImage}
        onClose={() => {
          setEditingImage(null);
          setEditingImageIndex(null);
        }}
        image={editingImage}
        onSave={handleSaveEditedImage}
      />
    </Dialog>
  );
};

export default FileUploadModal; 