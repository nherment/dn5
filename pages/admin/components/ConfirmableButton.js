import styled from 'styled-components'
import colors from '../colors'

const Button = styled.button.attrs({
  style: (props) => props.style
})`
  display: block;
  border: none;
  border-radius: 3px;
  padding: 8px 16px;
  line-height; 14px;
  font-size: 14px;
  color: #FFFFFF;
  background-color: ${colors.action.secondary};
  margin: 0 0 8px auto;
`

class ConfirmableButton extends React.Component {
  state = {
    confirmStateActive: false
  }

  onButtonClick = (evt) => {
    clearTimeout(this._confirmStateActiveTimeout)
    if(this.state.confirmStateActive) {
      this.setState({confirmStateActive: false})
      this.props.onClick(evt)
    } else {
      evt.preventDefault()
      evt.stopPropagation()
      this.setState({confirmStateActive: true}, () => {
        this._confirmStateActiveTimeout = setTimeout(() => {
          this.setState({confirmStateActive: false})
        }, 1000)
      })
    }
  }


  render() {
    return (
      <Button 
        style={this.state.confirmStateActive ? {...this.props.style, backgroundColor: colors.alert} : this.props.style} 
        onClick={this.onButtonClick}>{this.state.confirmStateActive ? 'Confirm' : this.props.children}</Button>
    )
  }
}

export default ConfirmableButton