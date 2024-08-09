import React, { Component } from 'react';
import { Box } from 'native-base';

class Separator extends Component {
  render() {
    return <Box h={this.props.height}></Box>;
  }
}

export default Separator;
