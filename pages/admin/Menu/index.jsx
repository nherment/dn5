import styled from 'styled-components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faPowerOff, faBell, faAssistiveListeningSystems } from '@fortawesome/free-solid-svg-icons'


const MenuContainer = styled.div`
  width: 80px;
  background-color: #262632;
  display: flex;
  flex-flow: column nowrap;
`

const Spacer = styled.div`
  flex-grow: 1;
`

const MenuItem = styled.div.attrs({
  style: props => ({
    backgroundColor: props && props.isActive ? '#2C2E3B' : 'transparent'
  })
})`
  width: 100%;
  padding: 20px 0;
  cursor: pointer;
  & > svg {
    display: block;
    margin: auto;
  }
`

const LogoContainer = styled.div`
  padding: 4px;
  margin: 4px;
  width: calc(100% - 16px);
  font-family: Arial;
  font-size: 15px;
  color: #EAEAEA;
  border: 1px solid #EAEAEA;
  border-radius: 3px;
  text-align: center;
`


class Menu extends React.Component {

  state = {
    activeMenuItem: 'users'
  }

  selectMenuItem = (menuItem) => {
    this.setState({activeMenuItem: menuItem})
    this.props.selectMenuItem(menuItem)
  }

  logout = () => {
    window.location = '/auth/logout'
  }

  render() {
    return (
      <MenuContainer>
        <LogoContainer>
          Auth-14
        </LogoContainer>
        <MenuItem isActive={this.state.activeMenuItem === 'monitors'} onClick={() => {this.selectMenuItem('monitors')}}>
          <FontAwesomeIcon icon={faAssistiveListeningSystems} color="#EAEAEA" size="2x"/>
        </MenuItem>
        <MenuItem isActive={this.state.activeMenuItem === 'alerts'} onClick={() => {this.selectMenuItem('alerts')}}>
          <FontAwesomeIcon icon={faBell} color="#EAEAEA" size="2x"/>
        </MenuItem>
        <Spacer/>
        <MenuItem isActive={this.state.activeMenuItem === 'info'} onClick={() => {this.selectMenuItem('info')}}>
          <FontAwesomeIcon icon={faInfo} color="#EAEAEA" size="2x"/>
        </MenuItem>
        <MenuItem onClick={this.logout}>
          <FontAwesomeIcon icon={faPowerOff} color="#EAEAEA" size="2x"/>
        </MenuItem>
      </MenuContainer>
    )
  }
}

export default Menu