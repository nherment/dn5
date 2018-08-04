

import React from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import moment from 'moment'

import {
  SystemIcon,
  ExclamationMark,
  CheckMark,
  colorFromStatus
} from './icons'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const Overview = styled.div`
  max-width: 500px;
  margin: 80px auto 50px auto;
`
const OverviewPrimaryContent = styled.div`
  width: 100%;
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  margin-top: 30px;
`
const OverviewSecondaryContent = styled.div`
  width: 100%;
  text-align: center;
  color: #BBBBBB;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
`

const MonitorsOverview = styled.div`
  max-width: 800px;
  width: calc(100% - 40px);
  margin: 0 auto;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-content: flex-start;
`
const Monitor = styled.div`
  margin: 5px;
  width: 340px;
  padding: 20px;
  border: 1px solid #CCCCCC;
  border-radius: 4px;

  display: flex;
  justify-content: space-between;
  align-items: center;
`
const MonitorName = styled.div`
  font-size: 20px;
  font-weight: bold;
`
const MonitorUptime = styled.div`
  font-size: 14px;
  color: #BBBBBB;
`
const MonitorStatus = styled.div`
  width: 40px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;

`
const MonitorStatusIcon = styled.div`
  & > svg {
    width: 30px;
    height: 30px;
  }
`
const MonitorStatusLabel = styled.div`
  text-transform: capitalize;
  font-size: 12px;
`

const Footer = styled.footer`
  display: block;
  margin: 50px auto 20px auto;
  text-align: center;
`

const Header = styled.header`
  padding: 0 20px;
  width: calc(100% - 40px);
  height: 30px;

  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
`
const StatusLevels = [
  {
    name: 'operational',
    label: 'All systems fully operational'
  }, {
    name: 'unstable',
    label: 'Some instability has been noticed'
  }, {
    name: 'incident',
    label: 'Incident detected'
  }
]

const truncateDecimals = (number, digits) => {
  var multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
  return truncatedNum / multiplier;
};


class StatusOverview extends React.Component {

  state = {
    status: StatusLevels[0],
    monitors: [{
      id: 1,
      name: 'Website',
      uptime: 99.9999999,
      status: 'operational'
    }, {
      id: 2,
      name: 'Schedule Optimization Engine',
      uptime: 99.9999999,
      status: 'unstable'
    }, {
      id: 3,
      name: 'Berth Optimization Engine',
      uptime: 99.9999999,
      status: 'incident'
    }]
  }

  componentDidMount = () => {
    this.interval = setInterval(() => {
      this.setState({
        status: StatusLevels[(StatusLevels.findIndex(status => status.name == this.state.status.name) + 1) % StatusLevels.length]
      })
    }, 5000)
  }
  componentWillUnmount = () => {
    clearInterval(this.interval)
  }
  renderMonitor(monitor) {
    return (
      <Monitor key={monitor.id}>
        <MonitorName>
          {monitor.name}
          <MonitorUptime>{truncateDecimals(monitor.uptime, 2)}% uptime for the last 30 days</MonitorUptime>
        </MonitorName>
        <MonitorStatus>
          <MonitorStatusIcon>
            {monitor.status === 'operational' && <CheckMark />}
            {monitor.status === 'unstable' && <ExclamationMark status="unstable"/>}
            {monitor.status === 'incident' && <ExclamationMark status="incident" />}
          </MonitorStatusIcon>
          <MonitorStatusLabel style={{color: colorFromStatus(monitor.status)}}>
            {monitor.status}
          </MonitorStatusLabel>
        </MonitorStatus>
      </Monitor>
    )
  }

  render() {

    return (
      <Container>
        <Header>
          <a href="/auth/login">Login</a>
        </Header>
        <Overview>
          <OverviewPrimaryContent>
            <SystemIcon width="128" height="128" status={this.state.status.name}/>
            <div>{this.state.status.label}</div>
          </OverviewPrimaryContent>
          <OverviewSecondaryContent>Last updated: {moment().fromNow()}</OverviewSecondaryContent>
        </Overview>
        <MonitorsOverview>
          {this.state.monitors.map(this.renderMonitor)}
        </MonitorsOverview>
        <Footer>
          If you are experiencing an issue, please contact <a href="mailto:support@portchain.com">support</a>.
        </Footer>
      </Container>
    )
  }
}

export default StatusOverview