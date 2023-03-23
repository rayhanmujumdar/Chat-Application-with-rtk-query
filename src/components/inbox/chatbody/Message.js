import moment from 'moment';
import {useState} from 'react'
export default function Message({ justify, message,timestamp }) {
    const [isTime,setTime] = useState(false)
    return (
        <li onClick={() => setTime(!isTime)} className={`cursor-pointer flex justify-${justify}`}>
            <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                <span className="block">{message}</span>
                {isTime && <span className='pt-2 block text-gray-500'>{moment(timestamp).fromNow()}</span>}
            </div>
        </li>
    );
}
