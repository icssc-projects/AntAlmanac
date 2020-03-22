import React, { Component, Fragment } from 'react';
import {
    MenuItem,
    Select,
    TextField,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Typography,
    Collapse,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import RightPaneStore from '../../stores/RightPaneStore';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { updateFormValue } from '../../actions/RightPaneActions';

const styles1 = {
    courseCode: {
        border: 'solid 8px transparent',
        borderLeft: '0px',
        borderTop: '0px',
    },
    instructor: {
        border: 'solid 8px transparent',
        borderLeft: '0px',
        borderTop: '0px',
        minWidth: '120px',
        flexBasis: '120px',
    },
    units: {
        border: 'solid 8px transparent',
        borderLeft: '0px',
        borderTop: '0px',
        minWidth: '80px',
        flexBasis: '80px',
    },
    coursesFull: {
        borderWidth: '8px 0px 8px 0px',
        borderStyle: 'solid',
        borderColor: 'transparent',
    },
    timePicker: {
        borderWidth: '8px 0px 8px 0px',
        borderStyle: 'solid',
        borderColor: 'transparent',
    },
    smallTextFields: {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
};

class AdvancedSearchTextFields extends Component {
    state = {
        courseCode: RightPaneStore.getFormData().courseCode,
        instructor: RightPaneStore.getFormData().instructor,
        units: RightPaneStore.getFormData().units,
        endTime: RightPaneStore.getFormData().endTime,
        startTime: RightPaneStore.getFormData().startTime,
        coursesFull: RightPaneStore.getFormData().coursesFull,
        building: RightPaneStore.getFormData().building,
    };

    handleChange = (name) => (event) => {
        if (name === 'endTime' || name === 'startTime') {
            if (event.target.value !== '') {
                if (parseInt(event.target.value.slice(0, 2), 10) > 12)
                    this.setState(
                        {
                            [name]:
                                parseInt(event.target.value.slice(0, 2), 10) -
                                12 +
                                ':00pm',
                        },
                        () => {
                            updateFormValue('startTime', this.state.startTime);
                            updateFormValue('endTime', this.state.endTime);
                        }
                    );
                else
                    this.setState(
                        {
                            [name]:
                                parseInt(event.target.value.slice(0, 2), 10) +
                                ':00am',
                        },
                        () => {
                            updateFormValue('startTime', this.state.startTime);
                            updateFormValue('endTime', this.state.endTime);
                        }
                    );
            } else {
                this.setState({ [name]: '' }, () => {
                    updateFormValue('startTime', '');
                    updateFormValue('endTime', '');
                });
            }
        } else if (name === 'online') {
            if (event.target.checked) {
                this.setState({ building: 'ON' });
                updateFormValue('building', 'ON');
            } else {
                this.setState({ building: '' });
                updateFormValue('building', 'ON');
            }
        } else {
            this.setState({ [name]: event.target.value });
            updateFormValue(name, event.target.value);
        }
    };

    /**
     * UPDATE (6-28-19): Transfered course code and course number search boxes to
     * separate classes.
     */
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.smallTextFields}>
                <TextField
                    label="Instructor"
                    type="search"
                    value={this.state.instructor}
                    onChange={this.handleChange('instructor')}
                    className={classes.instructor}
                    helperText="Last name only"
                />

                <TextField
                    id="units"
                    label="Units"
                    value={this.state.units}
                    onChange={this.handleChange('units')}
                    type="number"
                    helperText="ex. 3, 4, 1.7"
                    className={classes.units}
                />

                <FormControl className={classes.coursesFull}>
                    <InputLabel>Class Full Option</InputLabel>
                    <Select
                        value={this.state.coursesFull}
                        onChange={this.handleChange('coursesFull')}
                    >
                        <MenuItem value={'ANY'}>Include all classes</MenuItem>
                        <MenuItem value={'SkipFullWaitlist'}>
                            Include full courses if space on waitlist
                        </MenuItem>
                        <MenuItem value={'SkipFull'}>
                            Skip full courses
                        </MenuItem>
                        <MenuItem value={'FullOnly'}>
                            Show only full or waitlisted courses
                        </MenuItem>
                        <MenuItem value={'Overenrolled'}>
                            Show only over-enrolled courses
                        </MenuItem>
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                        <Switch
                            onChange={this.handleChange('online')}
                            value="online"
                            color="primary"
                            checked={this.state.building === 'ON'}
                        />
                    }
                    label="Online Classes Only"
                />

                <form className={classes.timePicker}>
                    <TextField
                        onChange={this.handleChange('startTime')}
                        label="Starts After"
                        type="time"
                        InputLabelProps={{
                            //fix saved search params
                            shrink: true,
                        }}
                        inputProps={{
                            step: 3600,
                        }}
                    />
                </form>

                <form className={classes.timePicker}>
                    <TextField
                        onChange={this.handleChange('endTime')}
                        label="Ends Before"
                        type="time"
                        InputLabelProps={{
                            //fix saved search param
                            shrink: true,
                        }}
                        inputProps={{
                            step: 3600,
                        }}
                    />
                </form>
            </div>
        );
    }
}

AdvancedSearchTextFields = withStyles(styles1)(AdvancedSearchTextFields);

const parentStyles = {
    container: {
        display: 'inline-flex',
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',

        '& > div': {
            marginRight: 5,
        },
    },
};

class AdvancedSearch extends Component {
    constructor(props) {
        super(props);

        let advanced = false;
        if (typeof Storage !== 'undefined') {
            advanced = window.localStorage.getItem('advanced') === 'expanded';
        }

        this.state = {
            expandAdvanced: advanced,
        };
    }

    handleExpand = () => {
        const nextExpansionState = !this.state.expandAdvanced;
        window.localStorage.setItem(
            'advanced',
            nextExpansionState ? 'expanded' : 'notexpanded'
        );
        this.setState({ expandAdvanced: nextExpansionState });
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <div onClick={this.handleExpand} className={classes.container}>
                    <div>
                        <Typography noWrap variant="subheading">
                            Advanced Search Options
                        </Typography>
                    </div>
                    {this.state.expandAdvanced ? (
                        <ExpandLess />
                    ) : (
                        <ExpandMore />
                    )}
                </div>
                <Collapse in={this.state.expandAdvanced}>
                    <AdvancedSearchTextFields />
                </Collapse>
            </Fragment>
        );
    }
}

export default withStyles(parentStyles)(AdvancedSearch);