import React, { Component } from 'react';
import {staffMembers,shifts,days, daysTotal } from './constants'

const styles = {
  container: {
    'display': 'flex',
    'justifyContent': 'space-evenly',
    'flexDirection': 'column',
    'alignItems': 'center',
    'height': 'calc(100vh)',
  }
}
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      schedule: [],
      staffRequired: 0,
      staffMembers,
      shifts,
      days,
      daysTotal
    }

    this.handleChange = this.handleChange.bind(this);
    this.getAssignment = this.getAssignment.bind(this);
    this.getWorkload = this.getWorkload.bind(this);
    this.clearShifts = this.clearShifts.bind(this);

  }

  componentDidMount() {
    fetch("http://localhost:5000/schedule")
    .then(response => response.json())
    .then(data => {
      this.setState({ schedule: data });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  handleChange(event, item, day) {
    const dayCount = this.state.schedule.filter(function (el) {
      return el.resource === event.target.value &&
             el.day === day
    });
    // Validation to check if resource has 2 shifts a day
    if(dayCount.length >= 2 ) {
      alert('Cannot Exceed 2 shifts a day');
      return
    }

    // Validation to check if resource has 2 shifts a day
    if(dayCount.length == 1) {
      alert('Warning: Staff member is selected for 2places at once');
    }

    const totalShiftCount = this.state.schedule.filter(function (el) {
      return el.resource === event.target.value
    });

    // Validation to check if resource has 7 shifts a week
    if(totalShiftCount.length >= 7 ) {
      alert('Cannot Exceed 7 shifts a week');
      return
    }

    let schedule = this.state.schedule;
    const found = schedule.find(v => v.shift === item && v.day === day);
    if(found)  {

      found.resource = event.target.value;
    }
    else {
      const newEntry = {
        resource: event.target.value,
        shift: item,
        day: day
      }
      schedule.push(newEntry);
    }

    fetch('http://localhost:5000/schedule', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(schedule),
})
.then(response => response.json())
.then(data => {
  this.setState({ schedule: data });
})
.catch((error) => {
  console.error('Error:', error);
});
  }

  getAssignment(item, day) {
    if(day) {
      const newArray = this.state.schedule.filter(function (el) {
        return el.shift === item &&
               el.day === day
      });
      return newArray.length && newArray[0].resource
    }
  }

  getWorkload(item, day) {
    if(day && day != 'total') {
      const newArray = this.state.schedule.filter(function (el) {
        return el.resource === item &&
               el.day === day
      });
      return newArray.length ? newArray.length : 0
    } else if(day && day === 'total'){
      const newArray = this.state.schedule.filter(function (el) {
        return el.resource === item 
      });
      return newArray.length
    }
  }

  getMemberNeeded() {
    const days = this.state.days.length;
    const shifts = this.state.shifts.length;
    const staffRequired = shifts*days/days;
    return staffRequired;
  }

  clearShifts() {
    fetch('http://localhost:5000/schedule', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify([]),
})
.then(response => response.json())
.then(data => {
  this.setState({ schedule: data });
})
.catch((error) => {
  console.error('Error:', error);
});
  }

  render() {
    const {daysTotal, staffMembers, shifts, days} = this.state;
    return (
        <div style={styles.container}>
        <table>
          <thead>
            <tr>
              <th></th>
              {days && days.map((item, index) => {
                return <th key={index}>{item.name}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {shifts && shifts.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td key={index}>{shifts[index].name}</td>
                {days && days.map((day, i) => {
                  return (
                    <React.Fragment>
                    {<td key={i}><select id={`${item.id}-${day.id}`} onChange={(event) => this.handleChange(event, item.id, day.id)} value={this.getAssignment(item.id, day.id)}>
                      <option></option>
                      {staffMembers.map((member, i) => <option key={i} value={member.id}>{member.name}</option>)}
                      </select></td>}
                    </React.Fragment>)
                })}
                </tr>)
            })}
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              {daysTotal && daysTotal.map((item, index) => {
                return <th key={index}>{item.name}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {staffMembers && staffMembers.map((item, index) => {
                  return (
                    <tr key={index}>
                {daysTotal && daysTotal.map((day, i) => {
                  return (
                    <React.Fragment>
                    {i === 0 ? <td key={i}>{item.id}</td>: <td key={i}>{this.getWorkload(item.id, day.id)}</td>}
                    </React.Fragment>)
                })}
                </tr>)
            })}
          </tbody>
        </table>

        <div>Total staff members needed to fill all shifts is: {this.getMemberNeeded()}</div>
        <div><button onClick={() => this.clearShifts()}>Clear shifts</button></div>
      </div>
    );
  }
}

export default App;
