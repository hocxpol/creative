import React from "react";
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import { useParams, useHistory } from "react-router-dom";

import Tickets from "../TicketsCustom"
import TicketAdvanced from "../TicketsAdvanced";

function TicketResponsiveContainer (props) {
    const { ticketId } = useParams();
    const history = useHistory();

    React.useEffect(() => {
        // Se ticketId for undefined, redireciona para /tickets
        if (typeof ticketId === 'undefined') {
            history.replace('/tickets');
        }
    }, [ticketId, history]);

    if (isWidthUp('md', props.width)) {
        return <Tickets />;    
    }
    return <TicketAdvanced />
}

export default withWidth()(TicketResponsiveContainer);