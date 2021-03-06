import React, {Component} from 'react'
import PropTypes from 'prop-types'
import SpeechRecognition from 'react-speech-recognition'
import {connect} from 'react-redux'
import {addLocation} from '../store/location'

function roundNumber(rnum, rlength) {
  var newnumber =
    Math.round(rnum * Math.pow(10, rlength)) / Math.pow(10, rlength)
  return newnumber
}

const propTypes = {
  // Props injected by SpeechRecognition
  transcript: PropTypes.string,
  resetTranscript: PropTypes.func,
  browserSupportsSpeechRecognition: PropTypes.bool
}

class Dictaphone extends Component {
  constructor() {
    super()
    this.state = {
      category: '',
      isRecorded: false,
      isHidden: true
    }
  }

  hidePanel = () => {
    this.setState({isHidden: true})
  }

  startRecording = () => {
    this.setState({isRecorded: true})
    this.setState({isHidden: false})
  }

  stopRecording = () => {
    this.setState({isRecorded: false})
  }

  chooseCategory = e => {
    const category = e.target.value
    this.setState({category})
  }

  save = transcript => {
    this.props.stopListening()
    this.props.resetTranscript()
    const lat = this.props.marker.lat
    const lng = this.props.marker.lng
    let category = this.state.category
    if (category === '') category = 'notes'
    const obj = {
      message: transcript,
      latitude: roundNumber(lat, 6),
      longitude: roundNumber(lng, 6),
      category
    }
    this.props.addLocation(obj, this.props.userId)
  }

  render() {
    const {
      transcript,
      resetTranscript,
      browserSupportsSpeechRecognition,
      startListening,
      stopListening
    } = this.props

    if (!browserSupportsSpeechRecognition) {
      return null
    }

    return (
      <div>
        {this.state.isHidden ? (
          <div>
            <button
              type="submit"
              onClick={() => {
                startListening()
                this.startRecording()
              }}
            >
              Start <i className="fa fa-microphone" />
            </button>
          </div>
        ) : (
          <div>
            <div>
              <button
                type="submit"
                onClick={() => {
                  startListening()
                  this.startRecording()
                }}
              >
                Start <i className="fa fa-microphone" />
              </button>
              <button
                type="submit"
                onClick={() => {
                  stopListening()
                  this.stopRecording()
                }}
              >
                Stop <i className="fa fa-pause-circle" />
              </button>
              <button type="submit" onClick={resetTranscript}>
                Reset <i className="fa fa-undo" />
              </button>
              <span>{transcript}</span>
              <select onChange={this.chooseCategory}>
                <option hidden="true">Choose Category</option>
                <option value="memories">memories</option>
                <option value="notes">notes</option>
                <option value="publicMessages">publicMessages</option>
              </select>
              <button
                type="submit"
                onClick={() => {
                  this.save(transcript)
                  this.stopRecording()
                  stopListening()
                }}
              >
                Save
              </button>
              <button
                type="submit"
                onClick={() => {
                  this.hidePanel()
                  resetTranscript()
                }}
              >
                Exit
              </button>
            </div>

            {this.state.isRecorded ? <div>Speak now.</div> : ''}
          </div>
        )}
      </div>
    )
  }
}

Dictaphone.propTypes = propTypes

const options = {
  autoStart: false
}

const mapState = state => {
  return {
    userId: state.user.id
  }
}

const mapDispatch = dispatch => {
  return {
    addLocation: (obj, userId) => dispatch(addLocation(obj, userId))
  }
}

export default connect(mapState, mapDispatch)(
  SpeechRecognition(options)(Dictaphone)
)
