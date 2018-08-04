import styled from 'styled-components'
import ConfirmableButton from '../components/ConfirmableButton'
import colors from '../colors'


const Container = styled.div`
  background-color: #EAEAEA;
  padding: 16px;
  flex-grow: 1;
`

const InputGroup = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  width: 100%;
`
const Label = styled.div`
  vertical-align: bottom;
  width: 100px;
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
  min-width: 500px;
`


const Input = styled.input`
  display: block;
  border: none;
  border-bottom: 2px solid ${colors.dark};
  padding-bottom: 2px;
  margin-top: 16px;
  line-height; 14px;
  font-size: 14px;
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

  handleUserFieldChange = (field) => {
    return (event) => {
      const monitor = this.state.monitor
      monitor[field] = event.target.value
      this.setState({monitor})
    }
  }

  componentWillReceiveProps = (props) => {
    if(props.monitor && props.monitor.id) {
      fetch(`/api/monitor/${props.monitor.id}`, {credentials: 'include'})
        .then((response) => {
          return response.json()
        }).then(monitor => {
          this.setState({monitor: monitor})
        }).catch(err => {
          console.error(err)
        })
    } else {
      this.setState({monitor: {...props.monitor}})
    }
  }

  deleteMonitor = (evt) => {
    evt.preventDefault()
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
    evt.preventDefault()
    const monitor = {...this.state.monitor}
    fetch('/api/monitor', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: monitor.id,
        name: monitor.name,
        url: monitor.url
      })
    })
    .then((response) => {
      if(response.status === 200) {
        if(!monitor.id) {
          return response.json()
        } else {
          return Promise.resolve(app)
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
            <InputGroup>
              <Label>Monitor name:</Label>
              <Input 
                value={this.state.monitor.name || ''} 
                onChange={this.handleUserFieldChange('name')}
                />
            </InputGroup>
            <InputGroup>
              <Label>URL:</Label>
              <Input 
                value={this.state.monitor.url || ''} 
                onChange={this.handleUserFieldChange('url')}
                />
            </InputGroup>
            {this.state.monitor.id && <InputGroup>
              <Label>ID:</Label>
              <Input 
                value={this.state.monitor.id || ''} 
                readOnly={true}
                />
            </InputGroup>}
          </InputsContainer>
          {this.state.monitor.id && <ButtonBox>
            <PrimaryButton onClick={this.saveMonitor}>Save</PrimaryButton>
            <SecondaryButton onClick={this.deleteMonitor}>Delete</SecondaryButton>
            <SecondaryButton onClick={this.rotateSecret}>Rotate secret</SecondaryButton>
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