import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import CircularProgress from "@material-ui/core/CircularProgress";

import Table from './Table'
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Tooltip from '@material-ui/core/Tooltip';
import H from '@material-ui/icons/HelpSharp';

 function getModalStyle() {
    return {
      margin: 'auto',
      width: "65%",
      height: "50%",
      top: 50,
      backgroundColor: "white",
      borderRadius: "none",


    };
  }


const styles = theme => ({
  root: {
    flexGrow: 0,
    backgroundColor: theme.palette.background.paper,
    maxHeight: "80vh",
    overflow: "scroll"
  },
  tabsRoot: {
    borderBottom: "1px solid #e8e8e8"
  },
  tabsIndicator: {
    backgroundColor: "#1890ff"
  },
  tabRoot: {
    textTransform: "initial",
    minWidth: 72,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing.unit * 4,
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(","),
    "&:hover": {
      color: "#40a9ff",
      opacity: 1
    },
    "&$tabSelected": {
      color: "#b78727",
      fontWeight: theme.typography.fontWeightMedium
    },
    "&:focus": {
      color: "#40a9ff"
    }
  },
  tabSelected: {},
  typography: {
    padding: theme.spacing.unit * 3
  }
});
class CustomizedTabs extends React.Component {
  state = {
    value: 0,
    load: 0,
    graphWinter: [],
    graphSpring: [],
    graphFall: [],
    courseForTableSpring: [],
    courseForTableWinter: [],
    courseForTableFall: []
  };
  //_____________________________________
  /**
   * @param  term which want to get courses for, 2018 Fall, or 2018 Spring
   * @return call calssObject() which return the course object or -1
   */
  askForCourseCode = async term => {
    const params = { department: this.props.term.dept, term: term };
    const url = new URL(
      "https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/websoc?"
    );
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );
    //console.log("dsdsadsad", url);
    const res = await fetch(url).then(response => response.json());
    const data = [...res[0].departments[0].courses];
    //console.log("dsadsa", data);
    return this.classObject(data);
  };
  //___________________________________________________________________
  /**
   * @param courses Json from askForCourseCode
   * @return course whih include comment, name, sections, and prerequisiteLink
   *          if course was not offered that term will return -1
   */
  classObject = arrayOfClasses => {
    for (let e of arrayOfClasses) {
      if (this.props.courseDetails.name[2] === e.name[2]) {
        //console.log(e);
        return e;
      }
    }
    return -1;
  };
  //___________________________________________________________________
  /**
   * @param quarter(w,f,s), year(18,17...), code which is course code
   * @return embed HTML Tag contianing img src
   */
  getGraph = async (quarter, year, code) => {
    const url_base =
      "https://l5qp88skv9.execute-api.us-west-1.amazonaws.com/dev/";
    const graph_url = url_base + quarter + "/" + year + "/" + code;
    return await fetch(graph_url).then(response => response.text());
  };
  //___________________________________________________
  listOfCodes = course => {
    const codeList = [];
    course.sections.forEach(section => {
      if (section.units !== "0") codeList.push(section.classCode);
    });
    //console.log("codelist", codeList);
    return codeList;
  };
  //___________________________________________________
  handleChange = async (event, value) => {
    this.setState({ value, load: 1 });
    //fall
    if (value === 2) {
      if (this.state.courseForTableFall.length === 0)
        //console.log(!this.state.courseForTableFall.length);
        this.askForCourseCode("2018 Fall").then(async responses => {
          if (responses !== -1) {
            this.setState({ courseForTableFall: responses });
            const codes = this.listOfCodes(responses);
            const gList = [];
            for (var code of codes) {
              this.state.graphFall.push(
                await this.getGraph("f", "18", code).then(result => result)
              );
            }
            this.setState({
              graphFall: this.state.graphFall,
              load: 0
            });
          } else this.setState({ courseForTableFall: null, load: 0 });
        });
    }
    // spring
    else if (value === 1) {
      this.askForCourseCode("2018 Spring").then(async responses => {
        if (responses !== -1) {
          this.setState({ courseForTableSpring: responses });
          const codes = this.listOfCodes(responses);
          for (var code of codes) {
            this.state.graphSpring.push(
              await this.getGraph("s", "18", code).then(result => result)
            );
          }
          this.setState({
            graphSpring: this.state.graphSpring,
            load: 0
          });
        } else this.setState({ courseForTableSpring: null, load: 0 });
      });
    }
    // winter
    else if (value === 0) {
      this.handleAction();
    }
  };
  /**
   * this will be called when the model open
   */
  handleAction = async () => {
    this.setState({ load: 1 });
    await this.askForCourseCode("2018 Winter").then(async responses => {
      if (responses !== -1) {
        this.setState({ courseForTableWinter: responses });
        const codes = this.listOfCodes(responses);
        for (var code of codes) {
          this.state.graphWinter.push(
            await this.getGraph("w", "18", code).then(result => result)
          );
        }
        this.setState({
          graphWinter: this.state.graphWinter,
          load: 0
        });
      } else this.setState({ courseForTableWinter: null, load: 0 });
    });
  };
  /**
   * reset the state for table and graphs
   */
  whatToRender = () => {
    const graphs = [];
    if (this.state.value === 0) {
      this.state.graphWinter.forEach(graphImg => {
        graphs.push(
          <div
            style={getModalStyle()}
            dangerouslySetInnerHTML={{ __html: graphImg }}
          />
        );
      });
    } else if (this.state.value === 1) {
      this.state.graphSpring.forEach(graphImg => {
        graphs.push(
          <div
            style={getModalStyle()}
            dangerouslySetInnerHTML={{ __html: graphImg }}
          />
        );
      });
    } else {
      this.state.graphFall.forEach(graphImg => {
        graphs.push(
          <div
            style={getModalStyle()}
            dangerouslySetInnerHTML={{ __html: graphImg }}
          />
        );
      });
    }
    return graphs;
  };

  table = () => {
    let all = [];
    let table = [];
    if (this.state.value === 0) table = this.state.courseForTableWinter;
    else if (this.state.value === 1) table = this.state.courseForTableSpring;
    else table = this.state.courseForTableFall;
    //console.log(table);
    if (table !== null && table.length !== 0) {
      table.sections.forEach(classInfo => {
        if (classInfo.units !== "0") all.push(<Table info={classInfo} />);
      });
    } else if (table === null) {
      all.push(
        <React.Fragment>
          <DialogTitle id="scroll-dialog-title">OPS!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This Class was not offered that term! Ask UCI office of reserch
              why at: IRB@research.uci.edu
            </DialogContentText>
          </DialogContent>
          <DialogActions />
        </React.Fragment>
      );
    } else if (!table.length) {
      all.push(<div />);
    }
    return all;
  };
  showMe = () => {
    if (this.state.load === 1) {
      return (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <CircularProgress size={50} />
        </div>
      );
    } else {
      const imgs = this.whatToRender();
      const talbes = this.table();
      const mix = [];
      for (let i = 0; i < talbes.length; i++) {
        mix.push(talbes[i]);
        mix.push(imgs[i]);
      }
      return mix;
    }
  };
  render() {
    //console.log(this.state, "\nPROPS", this.props);
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <Tabs
          centered={true}
          value={value}
          action={this.handleAction}
          onChange={this.handleChange}
          classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
        >
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Winter 18"
          />
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Spring 18"
          />
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Fall 18"
          />
          <Tooltip title="How to read!">
          <a style={{color:'#b78727',
                    fontSize:"48px" }}href={'https://almanac-team.herokuapp.com/index.html#support'} target="_blank" > <H  color="secondary"/> </a>
          </Tooltip>
        </Tabs>
        {this.showMe()}
      </div>
    );
  }
}
CustomizedTabs.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(CustomizedTabs);
