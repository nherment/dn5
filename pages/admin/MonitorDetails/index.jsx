import styled from 'styled-components'
import ConfirmableButton from '../components/ConfirmableButton'
import colors from '../colors'


const Container = styled.div`
  background-color: #EAEAEA;
  padding: 16px;
  flex-grow: 1;
`

const InputGroup = styled.div`
  margin-top: 16px;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  width: 100%;
`
const Label = styled.div`
  vertical-align: bottom;
  width: 200px;
  text-align: right;
  padding-right: 16px;
  color: ${colors.text.dark.secondary};
`

const Form = styled.form`
  display: flex;
  flex-flow: row;
  & > * {
    width: 50%;
  }
`

const InputsContainer = styled.div`
  min-width: 600px;
`


const Input = styled.input`
  display: block;
  border: none;
  border-bottom: 2px solid ${colors.dark};
  padding-bottom: 2px;
  line-height; 14px;
  font-size: 14px;
  background-color: transparent;
  min-width: 200px;
`
const TextArea = styled.textarea`
  min-width: 400px;
  min-height: 400px;

  border: 1px solid #BBBBBB;
  border-bottom: 2px solid ${colors.dark};
  background-color: transparent;
`
const ButtonBox = styled.div`
  margin-top: 32px;
  text-align: right;
`
const Button = styled.button`
  display: block;
  border: none;
  border-radius: 3px;
  padding: 8px 16px;
  line-height; 14px;
  font-size: 14px;
  color: #FFFFFF;
  margin: 0 0 8px auto;
`

const PrimaryButton = styled(Button)`
  background-color: ${colors.action.primary};
`
const SecondaryButton = styled(ConfirmableButton)`
  background-color: ${colors.action.secondary};
  margin: 0 0 8px auto;
`

class MonitorDetails extends React.Component {
  state = {
    monitor: {...this.props.monitor},
    rotateSecretStateActive: false
  }

  handleFieldChange = (field) => {
    return (event) => {
      const monitor = this.state.monitor
      monitor[field] = event.target.value
      this.setState({monitor})
    }
  }

  enable = (evt) => {
    evt.preventDefault()
    const monitor = this.state.monitor
    monitor.isActive = true
    this.setState({monitor}, () => {
      this.saveMonitor()
    })
  }

  disable = (evt) => {
    evt.preventDefault()
    const monitor = this.state.monitor
    monitor.isActive = false
    this.setState({monitor}, () => {
      this.saveMonitor()
    })
  }

  makePrivate = (evt) => {
    evt.preventDefault()
    const monitor = this.state.monitor
    monitor.isPublic = false
    this.setState({monitor}, () => {
      this.saveMonitor()
    })
  }

  makePublic = (evt) => {
    evt.preventDefault()
    const monitor = this.state.monitor
    monitor.isPublic = true
    this.setState({monitor}, () => {
      this.saveMonitor()
    })
  }

  componentWillReceiveProps = (props) => {
    this.setState({monitor: {...props.monitor}})
  }

  deleteMonitor = (evt) => {
    if(evt) {
      evt.preventDefault()
    }
    const monitor = {...this.state.monitor}
    fetch(`/api/monitor/${monitor.id}`, {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: monitor.id
      })
    }).then(() => {
      this.setState({monitor: {}})
      if(this.props.updateMonitor) {
        this.props.updateMonitor({})
      }
    })
  }

  saveMonitor = (evt) => {
    if(evt) {
      evt.preventDefault()
    }
    const monitor = {...this.state.monitor}
    fetch('/api/monitor', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(monitor)
    })
    .then((response) => {
      if(response.status === 200) {
        if(!monitor.id) {
          return response.json()
        } else {
          return Promise.resolve(monitor)
        }
      } else {
        return Promise.reject(new Error('Http error ' + response.status))
      }
    }).then((updatedMonitor) => {
      this.setState({monitor: updatedMonitor})
      if(this.props.updateMonitor) {
        this.props.updateMonitor(updatedMonitor)
      }
    })
  }

  render() {
    return (
      <Container>
        <Form>
          <InputsContainer>
            {this.state.monitor.id && <InputGroup>
              <Label>ID:</Label>
              <Input 
                value={this.state.monitor.id || ''} 
                readOnly={true}
                />
            </InputGroup>}
            <InputGroup>
              <Label>Monitor name:</Label>
              <Input 
                value={this.state.monitor.name || ''} 
                onChange={this.handleFieldChange('name')}
                />
            </InputGroup>
            <InputGroup>
              <Label>URL:</Label>
              <Input 
                value={this.state.monitor.url || ''} 
                onChange={this.handleFieldChange('url')}
                />
            </InputGroup>
            <InputGroup>
              <Label>Expected status:</Label>
              <Input 
                value={this.state.monitor.expectedStatusCode || ''} 
                onChange={this.handleFieldChange('expectedStatusCode')}
                />
            </InputGroup>
            <InputGroup>
              <Label>Frequency (s):</Label>
              <Input 
                value={this.state.monitor.frequencySeconds || ''} 
                onChange={this.handleFieldChange('frequencySeconds')}
                />
            </InputGroup>
            <InputGroup>
              <Label>Logic:</Label>
              <TextArea 
                value={this.state.monitor.validationLogic || ''} 
                placeholder="return true || 'Error message'"
                onChange={this.handleFieldChange('validationLogic')}
                ></TextArea>
            </InputGroup>
          </InputsContainer>
          {this.state.monitor.id && <ButtonBox>
            <PrimaryButton onClick={this.saveMonitor}>Save</PrimaryButton>
            <SecondaryButton onClick={this.deleteMonitor}>Delete</SecondaryButton>
          {this.state.monitor.isActive ?
            <SecondaryButton onClick={this.disable}>Disable</SecondaryButton>
            :
            <SecondaryButton onClick={this.enable}>Enable</SecondaryButton>
          } 
          {this.state.monitor.isPublic ?
            <SecondaryButton onClick={this.makePrivate}>Make private</SecondaryButton>
            :
            <SecondaryButton onClick={this.makePublic}>Make public</SecondaryButton>
          } 
          </ButtonBox>}
          {!this.state.monitor.id && <ButtonBox>
            <PrimaryButton onClick={this.saveMonitor}>Create</PrimaryButton>
          </ButtonBox>}
        </Form>
      </Container>
    )
  }
}

export default MonitorDetails