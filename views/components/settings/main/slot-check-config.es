import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, FormControl, FormGroup, InputGroup, ControlLabel, Collapse, Well } from 'react-bootstrap'
import { remote } from 'electron'
import { get } from 'lodash'

const { config, i18n } = window
const __ = i18n.setting.__.bind(i18n.setting)

const SlotCheckConfig = connect(() => {
  return (state, props) => ({
    type: props.type,
    enable: get(state.config, `poi.mapStartCheck.${props.type}.enable`, false),
    minFreeSlots: get(state.config, `poi.mapStartCheck.${props.type}.minFreeSlots`, ''),
  })
})(class SlotCheckConfig extends Component {
  static propTypes = {
    minFreeSlots: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    type: PropTypes.string,
    enable: PropTypes.bool,
  }
  constructor(props) {
    super(props)
    this.state = {
      showInput: false,
      value: props.minFreeSlots,
    }
  }
  CheckValid = (v) =>
    (!isNaN(parseInt(v)) && parseInt(v) >= 0)
  handleToggleInput = () => {
    if (this.state.showInput) {
      this.handleDisable()
    } else {
      const num = this.state.value
      this.setState({
        showInput: true,
        value: this.CheckValid(num) ? parseInt(num) : '',
      })
    }
  }
  handleChange = (e) => {
    this.setState({value: e.target.value})
  }
  handleSubmit = (e) => {
    e.preventDefault()
    if (this.CheckValid(this.state.value)) {
      const n = parseInt(this.state.value)
      config.set(`poi.mapStartCheck.${this.props.type}`, {
        enable: true,
        minFreeSlots: n,
      })
      this.setState({
        showInput: false,
        value: n,
      })
    } else {
      this.handleDisable()
    }
  }
  handleDisable = () => {
    config.set(`poi.mapStartCheck.${this.props.type}.enable`, false)
    this.setState({showInput: false})
  }
  render() {
    let toggleBtnStyle = this.props.enable ? 'success' : 'default'
    if (this.state.showInput) {
      toggleBtnStyle = 'danger'
    }
    let toggleBtnTxt = this.props.enable ? 'ON' : 'OFF'
    if (this.state.showInput) {
      toggleBtnTxt = __('Disable')
    }
    const toggleBtn = <Button onClick={this.handleToggleInput} bsSize='xs'
      bsStyle={toggleBtnStyle} style={{verticalAlign: 'text-bottom'}}>
      {toggleBtnTxt}
    </Button>
    const inputValid = this.CheckValid(this.state.value)
    const submitBtn = <Button type='submit'
      bsStyle={inputValid ? 'success' : 'danger'}>
      {inputValid ? __('Save') : __('Disable')}
    </Button>
    return (
      <div style={{margin: '5px 15px'}}>
        <form onSubmit={this.handleSubmit}>
          <div>
            {__(`${this.props.type} slots`)} {toggleBtn}
          </div>
          <Collapse in={this.state.showInput}>
            <div>
              <Well>
                <FormGroup>
                  <ControlLabel>{__(`Warn if the number of free ${this.props.type} slots is less than`)}</ControlLabel>
                  <InputGroup bsSize='small'>
                    <FormControl type="text"
                      bsStyle={inputValid ? 'success' : 'error'}
                      value={this.state.value}
                      onChange={this.handleChange}/>
                    <InputGroup.Button>
                      {submitBtn}
                    </InputGroup.Button>
                  </InputGroup>
                </FormGroup>
              </Well>
            </div>
          </Collapse>
        </form>
      </div>
    )
  }
})

export default SlotCheckConfig
