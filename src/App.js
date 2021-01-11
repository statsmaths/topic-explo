import React from 'react';
import './reset.css';
import './App.css';

// ***************************************************************************
// Helper function(s)

function ListBar(props) {
  var maxval = Math.max(...props.weights);
  var weights = props.weights.map(val => {
    return(100 * val / maxval)
  })

  return(
    <div
      className={"topic-list-container" + props.class}
      style={{width: props.width}}>
      <div className="topic-list-title">
        <span>{props.title}</span>
      </div>
      <div className="topic-list-row-head">
        <span>{props.titleleft}</span>
        <span>{props.titleright}</span>
      </div>
      {props.items.map( (val, i) => {
        var numcol = null;

        if (props.numcol) {
          numcol = (
            <div className="topic-list-percent">
              <span>{Math.round(props.weights[i]) + "%"}</span>
            </div>
          )
        }

        var clickid = i;
        if (props.clickids) {
          clickid = props.clickids[i];
        }

        var clickfun = props.clickfun;
        var clickclass = "topic-list-row";
        if (!clickfun) {
          clickfun = function() {};
          clickclass = "topic-list-row noclick"
        }

        return(
          <div
            className={clickclass}
            key={i}
            onClick={() => clickfun(clickid)}
            >
            <div
              className="topic-list-text">
              <span>{val}</span>
            </div>
            {numcol}
            <div className="topic-list-size">
            <div
              className="topic-list-inner"
              style={{width: weights[i] + "%"}}>
            </div>
            </div>
          </div>
        )
      })}

    </div>
  )
}

class DocumentBox extends React.Component {

  render() {

    let text = this.props.doc.text.map( (x) => { return(<p>{x}</p>) } );
    let meta = Object.entries(this.props.doc.meta).map(
      ([key, value]) => { return(<li>{key}: <span>{value}</span></li>) }
    );

    return(
      <div className="topic-meta">
        <ul>
          <li>Title: <span>{this.props.doc.title}</span></li>
          {meta}
        </ul>
        <div className="doc-text">
          {text}
        </div>
      </div>
    )
  }
}

class TopicContainer extends React.Component {

  // Override two standard methods of React.Component //

  constructor(props) {
    super(props);
    this.state = {
      td: null,
      topicstate: 'grid',
      topic: 0,
      topicdoc: 0
    }
  }

  componentDidMount() {
  }

  handleChangeTopic(topic) {
    this.setState({
      topic: topic,
      topicstate: 'topic',
    });
  }

  handleChangeTopicDoc(topicdoc) {
    this.setState({
      topicdoc: topicdoc,
      topicstate: 'doc',
    });
  }

  handleChangeTopicstate(value) {
    this.setState({
      topicstate: value,
    });
  }

  handleFileUpload = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      this.setState({
        td: JSON.parse(e.target.result),
        topicstate: 'grid'
      });
    };
  }

  render() {

    if (!this.state.td) {
      return (
        <div className={"topic-container "}>
          <div className="topic-header">
            <span>Topic Model Visualizer</span>
          </div>
          <div className="file-loader">
            <label class="button" for="upload">Upload JSON File</label>
            <input id="upload" type="file" onChange={this.handleFileUpload} />
          </div>
        </div>
      )
    }

    var topicpart = null;
    var subtitle = "All Topics";

    if (this.state.topicstate === "grid") {
      var weights = this.state.td.topics.map(val => {return(val.proportion)});

      topicpart = (
        <div className="topic-part">
          <ListBar
            titleleft="topic"
            titleright="proportion of corpus"
            items={this.state.td.topics.map(val => {return(val.long)})}
            weights={weights}
            width="800px"
            clickfun={this.handleChangeTopic.bind(this)}
            numcol={true}
            class=""
          />
        </div>
      );
    }

    if (this.state.topicstate === "topic") {
      let top_docs = this.state.td.topics[this.state.topic].top_docs_ids.map(
        (x, i) => {
          return(this.state.td.docs[x].title)
        }
      );

      subtitle = this.state.td.topics[this.state.topic].long;

      topicpart = (
        <div className="topic-part">
          <div style={{width: '1200px'}}>
          <ListBar
            title="Associated Words"
            titleleft="word"
            titleright="weight"
            items={this.state.td.topics[this.state.topic].top_word}
            weights={this.state.td.topics[this.state.topic].word_wgt}
            width="350px"
            numcol={false}
            class=""
          />
          <ListBar
            title="Associated Documents"
            titleleft="document"
            titleright="proportion in topic"
            items={top_docs}
            weights={this.state.td.topics[this.state.topic].doc_perc}
            width="750px"
            clickfun={this.handleChangeTopicDoc.bind(this)}
            clickids={this.state.td.topics[this.state.topic].top_docs_ids}
            numcol={true}
            class=" topic-list-two"
          />
          </div>
        </div>
      );
    }
    if (this.state.topicstate === "doc") {
      let top_topics = this.state.td.docs[this.state.topicdoc].top_topics_ids.map(
        (x, i) => {
          return(this.state.td.topics[x].short)
        }
      );

      subtitle = "Document: "+ this.state.td.docs[this.state.topicdoc].title;

      topicpart = (
        <div>
          <div className="topic-part">
            <ListBar
              titleleft="Group"
              titleright="proportion of document"
              items={top_topics}
              weights={this.state.td.docs[this.state.topicdoc].topic_weights}
              clickfun={this.handleChangeTopic.bind(this)}
              clickids={this.state.td.docs[this.state.topicdoc].top_topics_ids}
              width="300px"
              numcol={true}
              class=""
            />
          </div>
          <DocumentBox
            doc={this.state.td.docs[this.state.topicdoc]}
          />
        </div>
      );
    }

    return (
      <div className={"topic-container "}>
        <div className="topic-header">
          <span>{subtitle}</span>
        </div>
        <div className="file-loader">
          <label class="button" for="upload">Upload JSON File</label>
          <input id="upload" type="file" onChange={this.handleFileUpload} />
        </div>
        <div className="nav-top">
          <span onClick={() => this.handleChangeTopicstate("grid")}>
            [all topics]
          </span>
        </div>
        {topicpart}
      </div>
    )
  }
}


// ***************************************************************************
// Main class that holds the state of the App

class Viewer extends React.Component {

  render() {

    return (
      <TopicContainer/>
    );
  }
}

// ***************************************************************************
// Wrap the App and return the rendered Viewer

function App() {
  return (
    <Viewer />
  );
}

export default App;
