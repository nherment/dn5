import styled from 'styled-components'

import Menu from './Menu'
import Monitors from './Monitors'
import MonitorDetails from './MonitorDetails'

const Container = styled.div`
  display: flex;
  height: 100%;
`

class Main extends React.Component {
  state = {
    activeMenuItem: 'monitors',
    selectedItem: null
  }

  selectMenuItem = (menuItem) => {
    this.setState({activeMenuItem: menuItem, selectedItem: null})
  }
  selectItem = (item) => {
    this.setState({selectedItem: item})
  }

  updateItem = (item) => {
    this.selectItem(item)
  }

  render() {
    return (
      <Container>
        <Menu selectMenuItem={this.selectMenuItem}/>

        {this.state.activeMenuItem === 'monitors' && <Monitors itemLabel="Monitor"
            activeItem={this.state.selectedItem} 
            selectItem={this.selectItem}/>}
        {this.state.activeMenuItem === 'monitors' && 
          <MonitorDetails
            monitor={this.state.selectedItem}
            updateMonitor={this.updateItem}/>}
        
      </Container>
    )
  }
}

export default Main