import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  IconButton
} from '@material-ui/core';
import { 
  Person,
  Phone,
  Email,
  Business,
  Save as SaveIcon,
  Chat as ChatIcon
} from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    maxWidth: 400,
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  content: {
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  name: {
    fontWeight: 'bold',
  },
  infoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  infoIcon: {
    marginRight: theme.spacing(1),
    fontSize: '1.2rem',
    color: theme.palette.text.secondary,
  },
  infoText: {
    fontSize: '0.9rem',
    color: theme.palette.text.primary,
    wordBreak: 'break-word',
  },
  buttonsContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));

const VcardPreview = ({ contact }) => {
  const classes = useStyles();
  const history = useHistory();

  // Função para extrair informações do vCard
  const extractVCardInfo = (vcard) => {
    if (!vcard) return null;

    // Se for um objeto com vcard e displayName
    if (typeof vcard === 'object' && vcard.vcard) {
      const vcardString = vcard.vcard;
      const info = {
        name: vcard.displayName || '',
        phones: [],
        email: '',
        company: '',
        description: ''
      };

      // Split by newline and handle both \n and \r\n
      const lines = vcardString.split(/\r?\n/);
      
      lines.forEach(line => {
        if (line.startsWith('FN:')) {
          info.name = line.substring(3).trim();
        } else if (line.startsWith('N:')) {
          // Extract name from N field if FN is not present
          const nameParts = line.substring(2).split(';');
          if (!info.name && nameParts[0]) {
            info.name = nameParts[0].trim();
          }
        } else if (line.startsWith('TEL;') || line.startsWith('TEL:')) {
          const phone = line.split(':')[1]?.trim();
          if (phone) {
            // Clean up the phone number
            const cleanPhone = phone.replace(/[^\d+]/g, '');
            info.phones.push(cleanPhone);
          }
        } else if (line.startsWith('EMAIL;') || line.startsWith('EMAIL:')) {
          info.email = line.split(':')[1]?.trim();
        } else if (line.startsWith('ORG:')) {
          info.company = line.substring(4).trim();
        } else if (line.startsWith('X-WA-BIZ-NAME:')) {
          info.company = line.substring(13).trim();
        } else if (line.startsWith('X-WA-BIZ-DESCRIPTION:')) {
          info.description = line.substring(20).trim();
        }
      });

      return info;
    }

    // Se for uma string de vCard direta
    if (typeof vcard === 'string') {
      const info = {
        name: '',
        phones: [],
        email: '',
        company: '',
        description: ''
      };

      const lines = vcard.split(/\r?\n/);
      
      lines.forEach(line => {
        if (line.startsWith('FN:')) {
          info.name = line.substring(3).trim();
        } else if (line.startsWith('N:')) {
          const nameParts = line.substring(2).split(';');
          if (!info.name && nameParts[0]) {
            info.name = nameParts[0].trim();
          }
        } else if (line.startsWith('TEL;') || line.startsWith('TEL:')) {
          const phone = line.split(':')[1]?.trim();
          if (phone) {
            const cleanPhone = phone.replace(/[^\d+]/g, '');
            info.phones.push(cleanPhone);
          }
        } else if (line.startsWith('EMAIL;') || line.startsWith('EMAIL:')) {
          info.email = line.split(':')[1]?.trim();
        } else if (line.startsWith('ORG:')) {
          info.company = line.substring(4).trim();
        } else if (line.startsWith('X-WA-BIZ-NAME:')) {
          info.company = line.substring(13).trim();
        } else if (line.startsWith('X-WA-BIZ-DESCRIPTION:')) {
          info.description = line.substring(20).trim();
        }
      });

      return info;
    }

    return null;
  };

  const vcardInfo = extractVCardInfo(contact);
  if (!vcardInfo) return null;

  const handleSaveContact = () => {
    try {
      const element = document.createElement('a');
      const vcard = contact.vcard;
      const file = new Blob([vcard], { type: 'text/vcard' });
      element.href = URL.createObjectURL(file);
      element.download = `${vcardInfo.name || 'contact'}.vcf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {

    }
  };

  const handleStartChat = () => {
    if (vcardInfo.phones && vcardInfo.phones.length > 0) {
      const number = vcardInfo.phones[0].replace(/\D/g, '');
      history.push(`/tickets/new/${number}`);
    }
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <div className={classes.header}>
          <Person className={classes.icon} />
          <Typography variant="h6" className={classes.name}>
            {vcardInfo.name || 'Contato'}
          </Typography>
        </div>

        {vcardInfo.phones.map((phone, index) => (
          <div key={index} className={classes.infoContainer}>
            <Phone className={classes.infoIcon} />
            <Typography className={classes.infoText}>
              {phone}
            </Typography>
          </div>
        ))}

        {vcardInfo.email && (
          <div className={classes.infoContainer}>
            <Email className={classes.infoIcon} />
            <Typography className={classes.infoText}>
              {vcardInfo.email}
            </Typography>
          </div>
        )}

        {vcardInfo.company && (
          <div className={classes.infoContainer}>
            <Business className={classes.infoIcon} />
            <Typography className={classes.infoText}>
              {vcardInfo.company}
            </Typography>
          </div>
        )}

        {vcardInfo.description && (
          <div className={classes.infoContainer}>
            <Typography className={classes.infoText}>
              {vcardInfo.description}
            </Typography>
          </div>
        )}

        <div className={classes.buttonsContainer}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveContact}
            size="small"
          >
            Salvar Contato
          </Button>
          {vcardInfo.phones.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ChatIcon />}
              onClick={handleStartChat}
              size="small"
            >
              Iniciar Conversa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

VcardPreview.propTypes = {
  contact: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      vcard: PropTypes.string,
      name: PropTypes.string,
      displayName: PropTypes.string,
      phones: PropTypes.arrayOf(PropTypes.string),
      phone: PropTypes.string,
      email: PropTypes.string,
      company: PropTypes.string,
      org: PropTypes.string,
    })
  ]).isRequired,
};

export default VcardPreview;
