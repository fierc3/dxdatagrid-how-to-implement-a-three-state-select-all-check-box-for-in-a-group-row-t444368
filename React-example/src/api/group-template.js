import React from "react";
import CheckBox from "devextreme-react/check-box";

class GroupTemplate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkBox_value: this.props.checked
    }
  }

  handleValueChange(e) {
    const previousValue = e.previousValue;
    const newValue = e.value;
    // Event handling commands go here

  
    if(!e.event){
      e.value = previousValue;
    }
   this.props.onValueChanged(e);
}

  render() {
    return (
      <React.Fragment>
        <CheckBox
          value={this.props.checked}
          onValueChanged={(e) =>this.handleValueChange(e)}

        />
        <span style={{ marginLeft: "5px" }}> {this.props.groupText} </span>
      </React.Fragment>
    );
  }
}

export default GroupTemplate;
