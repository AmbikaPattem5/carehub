import { useState } from "react"
import InVoiceModal from "../Components/InVoiceModal"
function Billing() {
    const [isBilling, setIsBilling] = useState<boolean>(false)
    function handleClose() {
        setIsBilling(true)
    }
    return (
        <div>
            Billing
            <button onClick={handleClose}>Add Invoice</button>
            {isBilling && <InVoiceModal onClose={handleClose} />}
        </div>


    )
}
export default Billing;