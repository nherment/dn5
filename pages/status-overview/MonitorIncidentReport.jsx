

import React from 'react'
import styled from 'styled-components'
import * as colors from '../colors'
import Markdown from 'react-markdown'
import moment from 'moment'
import { 
  calculateIncidentStatusLevel,
  humanReadableTimeDifference,
  truncateDecimals
} from './util';

const Container = styled.div`

  border: 1px solid #CCCCCC;
  border-radius: 4px;
  position: relative;
  padding: 20px;
  width: calc(100% - 40px);
`
const MonitorOverview = styled.div`
  padding-bottom: 8px;
`
const MonitorName = styled.h1`
  margin: 0 0 8px 0;
  display: inline-block;
`

const MonitorLastUpdate = styled.div`
  color: #555555;
`

const ActionsContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`

const ButtonLink = styled.button`
  background-color: transparent;
  border: none;
  color: #972ac0;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`

const Incident = styled.div.attrs({
  style: (props) => {
    if(props.status) {
      return {
        borderLeft: `5px solid ${colors.colorFromStatus(props.status)}` 
      }
    }
  }
})`
  border-left: 5px solid #BBBBBB;
  border-top: 1px solid #BBBBBB;
  border-bottom: 1px solid #BBBBBB;
  border-right: 1px solid #BBBBBB;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  margin: 16px 0;
  padding: 8px;
`

const IncidentHeader = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
`
const IncidentTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  margin-right: 16px;
`
const SectionTitle = styled.h2`
  width: 100%;
  text-align: right;
  border-top: 1px solid #BBBBBB;
  margin: 32px 0 16px 0;
  font-size: 20px;
  font-weight: normal;
`
const SubSectionTitle = styled.h4`
  width: 100%;
  text-align: right;
  border-top: 1px solid #BBBBBB;
  margin: 16px 0 0 0;
  font-size: 14px;
  font-weight: normal;
`

const PlaceholderMessage = styled.div`
  width: 100%;
  margin: 32px 0;
  text-align: center;
`


const IncidentEvents  = styled.ul`
  margin: 8px 0;
  padding: 0;
  list-style: none;
`
const IncidentEvent  = styled.li`
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: start;
  align-items: start;
`
const IncidentEventHeader = styled.div`
  margin: 4px 0;
  width: 150px;
  overflow: hidden;
  white-space: nowrap;
`
const IncidentEventTitle = styled.div`
  font-weight: bold;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const EventDescription = styled(Markdown)`
  padding-left: 16px;
  flex-grow: 1;
  & p {
    margin: 4px 0;
  }
`

const IncidentDescription = styled(Markdown)`
`
const UptimesContainer = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`
const Uptime = styled.div`
  margin: 10px;
`

const UptimeNumber = styled.div`
  padding: 20px;
  font-size: 20px;
  font-weight: bold;
  color: #307bbb;
`

const UptimeLabel = styled.div`
  text-align: center;
  font-size: 14px;
`

const StyledDate = styled.div`
  margin-right: 16px;
  font-weight: normal;
  font-size: 12px;
`
const StyledDatePrefix = styled.div`
  display: block;
  color: #555555;
  font-size: 13px;
`
const FormatDate = (props) => {
  let format = '[today at] HH:mm'
  if(moment().year() !== props.date.year()) {
    format = 'MMM Do[,] YYYY [at] HH:mm'
  } else if(moment().month() !== props.date.month()) {
    format = 'MMM Do[, at] HH:mm'
  } else if(moment().date() !== props.date.date()) {
    format = '[the] Do[, at] HH:mm'
  }
  return (
    <StyledDate>
      {props.prefix && <StyledDatePrefix>{props.prefix}</StyledDatePrefix>}
      {props.date.format(format)}
    </StyledDate>
  )
}
const FormatDuration = (props) => {
  const str = humanReadableTimeDifference(props.from, props.to)
  return (
    <StyledDate>
      {props.prefix && <StyledDatePrefix>{props.prefix}</StyledDatePrefix>}
      {str}
    </StyledDate>
  )
}

class StatusOverview extends React.Component {
  renderIncidentEvent = (event) => {
    return (
      <IncidentEvent key={event.id}>
        <IncidentEventHeader>
          {event.title && 
            <IncidentEventTitle title={event.title}>
              {event.title}
            </IncidentEventTitle>
          }
          <FormatDate date={event.createdDate}/>

        </IncidentEventHeader>
        {event.description && <EventDescription source={event.description}/>}
      </IncidentEvent>
    )
  }

  renderIncident = (incident) => {
    return (
      <Incident key={incident.id} status={incident.closedDate ? 'operational' : calculateIncidentStatusLevel(incident).name}>
        <IncidentHeader>
          <IncidentTitle>
            {incident.title}
          </IncidentTitle>
          <FormatDuration from={incident.createdDate} to={incident.closedDate || moment()} prefix={'Duration'}/>
          <FormatDate date={incident.createdDate} prefix={'Started'}/>
          {incident.closedDate && <FormatDate date={incident.closedDate} prefix={'Resolved'}/>}
        </IncidentHeader>
        {incident.description && <IncidentDescription source={incident.description}/>}
        <SubSectionTitle>Events</SubSectionTitle>
        <IncidentEvents>
          {incident.events && incident.events.map(this.renderIncidentEvent)}
        </IncidentEvents>
      </Incident>
    )
  }

  render() {
    return (
      <Container>
        <ActionsContainer>
          <ButtonLink onClick={this.props.onClose}>close</ButtonLink>
        </ActionsContainer>
        <MonitorOverview>
          <MonitorName>
            {this.props.monitor.name}
          </MonitorName>
          <MonitorLastUpdate>
            Last check: {this.props.monitor.lastCheckDate ? this.props.monitor.lastCheckDate.format('dddd, MMM YYYY HH:mm') : 'never'}
          </MonitorLastUpdate>
        </MonitorOverview>
        <SectionTitle key="uptime-section-title">Uptime</SectionTitle>
        <UptimesContainer>
          <Uptime>
            <UptimeNumber>
              {truncateDecimals(this.props.monitor.monthToDateUptime || 100, 2)}
            </UptimeNumber>
            <UptimeLabel>Month to date</UptimeLabel>
          </Uptime>
          <Uptime>
            <UptimeNumber>
              {truncateDecimals(this.props.monitor.rollingMonthUptime || 100, 2)}
            </UptimeNumber>
            <UptimeLabel>Rolling month</UptimeLabel>
          </Uptime>
          <Uptime>
            <UptimeNumber>
              {truncateDecimals(this.props.monitor.rollingYearUptime || 100, 2)}
            </UptimeNumber>
            <UptimeLabel>Rolling year</UptimeLabel>
          </Uptime>
        </UptimesContainer>
        {this.props.monitor.activeIncident && [
          <SectionTitle key="active-incident-section-title">Incident in progress</SectionTitle>,
          this.renderIncident(this.props.monitor.activeIncident)
        ]}
        {this.props.monitor.closedIncidents && this.props.monitor.closedIncidents.length > 0 && [
          <SectionTitle key="closed-incidents-section-title">Closed incidents</SectionTitle>,
          this.props.monitor.closedIncidents.map(this.renderIncident)
        ]}
        {!this.props.monitor.activeIncident && 
          (!this.props.monitor.closedIncidents || this.props.monitor.closedIncidents.length === 0) &&
          <PlaceholderMessage>
            No incident recorded
          </PlaceholderMessage>
        }
      </Container>
    )
  }
}

export default StatusOverview