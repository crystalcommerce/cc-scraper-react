import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';


export default function DropdownButton({dropDownOptions, optionClickHandler, size}) {
	const options = dropDownOptions;
	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef(null);
	const [selectedIndex, setSelectedIndex] = React.useState(0);

	const handleClick = () => {
		optionClickHandler(options[selectedIndex]);
	};

	const handleMenuItemClick = (event, index) => {
		setSelectedIndex(index);
		setOpen(false);
	};

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	const handleClose = (event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
		return;
		}

		setOpen(false);
	};

	return (

			<>
				<ButtonGroup size={size || "small"} variant="contained" color="primary" ref={anchorRef} aria-label="split button">
					<Button startIcon={options[selectedIndex].icon} size={size || "small"} onClick={handleClick}>{options[selectedIndex].label}</Button>
					<Button
						color="primary"
						size={size || "small"}
						aria-controls={open ? 'split-button-menu' : undefined}
						aria-expanded={open ? 'true' : undefined}
						aria-label="select merge strategy"
						aria-haspopup="menu"
						onClick={handleToggle}
					>
						<ArrowDropDownIcon />
					</Button>
				</ButtonGroup>
				<Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
				{({ TransitionProps, placement }) => (
					<Grow
					{...TransitionProps}
					style={{
						transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
					}}
					>
					<Paper>
							<ClickAwayListener onClickAway={handleClose}>
								<MenuList id="split-button-menu" size={size || "small"} style={{zIndex : 5}}>
									{options.map((option, index) => (
										<MenuItem
											key={option}
											disabled={index === 7}
											selected={index === selectedIndex}
											onClick={(event) => handleMenuItemClick(event, index)}
											size={size || "small"}
										>	
											{option.label}
										</MenuItem>
									))}
								</MenuList>
							</ClickAwayListener>
					</Paper>
					</Grow>
				)}
				</Popper>
			</>

	)
}
