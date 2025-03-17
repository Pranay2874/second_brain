
import { Button } from './components/Button'
import { PlusIcon } from './icons/PlusIcon'
import { ShareIcon } from './icons/ShareIcon'

function App() {

  return (
    <>
     <Button variant='primary' startIcon={<PlusIcon/>} text='Add content'></Button>
     <Button variant='secondary' startIcon={<ShareIcon/>} text='Share Brain'></Button>
    </>

  ) 
}

export default App