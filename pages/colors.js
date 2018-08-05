export const operational = '#18b73a'
export const unstable = '#ec9c25'
export const incident = '#f1244c'

export const colorFromStatus = (status) => {
  if(status === 'unstable') {
    return unstable
  } else if(status === 'incident') {
    return incident
  } else {
    return operational
  }
}
