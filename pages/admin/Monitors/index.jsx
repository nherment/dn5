import styled from 'styled-components'
import colors from '../colors'

const Container = styled.div`
  position: relative;
  color: #EAEAEA;
  width: 400px;
  padding: 8px;
  background-color: #2C2E3B;
  h1 {
    margin: 0;
    margin-bottom: 16px;
    padding: 0;
  }
`

const Title = styled.h1`
  margin-top: 0;
  font-weight: 400;
`

const SearchInput = styled.input`
  border: none;
  border-radius: 3px;
  padding: 4px;
  line-height; 14px;
  font-size: 14px;
  width: calc(100% - 8px);
`

const ItemList = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  margin-top: 16px;
`
const NewItemButton = styled.button`
  display: block;
  border: none;
  border-radius: 3px;
  padding-bottom: 2px;
  padding: 8px 16px;
  margin: 8px;
  line-height; 14px;
  font-size: 14px;
  color: #FFFFFF;
  background-color: ${colors.action.secondary};
  position: absolute;
  top: 8px;
  right: 0;
  &:hover {
    background-color: ${colors.action.primary};
  }
`

const ItemItem = styled.div.attrs({
  style: props => ({
    borderTopRightRadius: props && props.isSelected ? '0' : '3px',
    borderBottomRightRadius: props && props.isSelected ? '0' : '3px',
    backgroundColor: props && props.isSelected ? '#EAEAEA' : '#262632',
    padding: props && props.isSelected ? '8px 16px 8px 8px' : '8px 8px'
  })
})`
  width: calc(100% - 16px);
  margin-bottom: 8px;
  border-radius: 3px;
  cursor: pointer;
`
const ItemFullName = styled.div.attrs({
  style: props => ({
    color: props && props.isSelected ? '#262632' : '#ADBBD6',
    textDecoration: props && props.isActive ? null : 'line-through'
  })
})`
  display: block;
  font-size: 16px;
`
const ItemEmail = styled.div.attrs({
  style: props => ({
    color: props && props.isSelected ? '#999999' : '#6B7284'
  })
})`
  display: inline-block;
  float: right;
  font-size: 11px;
`
const ItemCompany = styled.div.attrs({
  style: props => ({
    color: props && props.isSelected ? '#999999' : '#6B7284'
  })
})`
  display: inline-block;
  font-size: 12px;
  font-weight: 400;
`

class Items extends React.Component {

  state = {
    items: [],
    activeItem: null,
    searchTerm: ''
  }

  search = (searchTerm) => {
    this.setState({searchTerm})
    fetch(`/api/monitors?searchTerm=${searchTerm}`, {credentials: 'include'})
      .then((response) => {
        return response.json()
      }).then(items => {
        this.setState({items})
      }).catch(err => {
        console.error(err)
      })
  }

  searchItems = (event) => {
    this.search(event.target.value)
  }

  componentDidMount = () => {
    fetch('/api/monitors', {credentials: 'include'})
      .then((response) => {
        return response.json()
      }).then(items => {
        this.setState({items})
      }).catch(err => {
        console.error(err)
      }) 
  }

  selectItem = (item) => {
    // this.setState({activeItem: item})
    if(this.props.selectItem) {
      this.props.selectItem(item)
    }
  }

  componentWillReceiveProps = (props) => {
    this.setState({activeItem: {...props.activeItem}})
    this.search(this.state.searchTerm)
  }

  renderItem = (item) => {
    const isSelected = this.state.activeItem && this.state.activeItem.id === item.id
    if(isSelected) {
      // item might have been updated by parent. refreshing all attrs.
      Object.assign(item, this.state.activeItem);
    }
    return (
      <ItemItem key={item.id} isSelected={isSelected} onClick={() => this.selectItem(item)}>
        <ItemFullName title={item.isActive ? '' : `${this.props.itemLabel} is disabled`} isActive={item.isActive} isSelected={isSelected}>{item.name}</ItemFullName>
        <ItemEmail isSelected={isSelected}>{item.url}</ItemEmail>
        <ItemCompany isSelected={isSelected}>{item.company}</ItemCompany>
      </ItemItem>
    )
  }

  createNewItem = () => {
    this.selectItem({})
  }

  render() {
    return (
      <Container>
        <Title>{this.props.itemLabel}s</Title>
        <NewItemButton onClick={this.createNewItem}>New {this.props.itemLabel}</NewItemButton>
        <SearchInput 
          value={this.state.searchTerm}
          onChange={this.searchItems} 
          placeholder={`Search for ${this.props.itemLabel}...`}/>
        <ItemList>
          {this.state.items.map(this.renderItem)}
        </ItemList>
      </Container>
    )
  }
}

export default Items