import { useSelector } from "react-redux"
import { Notification } from "./Notification";

export const NotificationDispatcher = () => {

    const notifications = useSelector((state) => state.app.Notifications);

    return (
        <div className='notification'>

            {notifications.length > 0 && notifications.map((item) => 
                <Notification key={item.id} id={item.id} message={item.message} errorType={item.errorType}/>
            )}
        </div>
    )
}