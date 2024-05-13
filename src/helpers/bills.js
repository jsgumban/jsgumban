export  const formatReadableDate = (dateString) => {
	if (!isValidDate(dateString)) {
		return dateString;
	}
	
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', options);
}

export const isValidDate = (dateString) => {
	if (!dateString) return false;
	
	// Extract the date part before the 'T'
	const datePart = dateString?.split('T')[0];
	
	// Regular expression to check the basic format YYYY-MM-DD
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	
	// Check the basic format of the date part
	if (!datePart.match(regex)) return false;
	
	// Parse the date parts to integers
	const parts = datePart.split('-');
	const year = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10) - 1; // Month is 0-based
	const day = parseInt(parts[2], 10);
	
	// Check the ranges of month and year
	if (year < 1000 || year > 3000 || month < 0 || month > 11) {
		return false;
	}
	
	// Create a date object with the parts
	const date = new Date(year, month, day);
	
	// Check if the date object's month and day match the inputs
	if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
		return false;
	}
	
	return true;
}

export const formatMoneyIntl = (amount = 0, locale = 'en-US', currency = 'PHP') => {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
	}).format(amount);
}

export const makeValueReadable = (formFields, key, value) => {
	const field = formFields.find(x => x.name == key);
	if (field?.reactType && field?.reactType == 'select') {
		return getValueByKey(formFields, key, value);
	}

	if (key == 'creditLimit') {
		value = formatMoneyIntl(value);
	}

	if (field.reactType == 'date') {
		value = formatReadableDate(value)
	}
	
	return value;
}

export const getValueByKey = (formFields, key, value) => {
	const data = formFields.find(x => x.name == key);
	const source = data.source.find(x => x.id == value);
	return source?.name;
}

export const makeKeyReadable = (key) => {
	// Split the key into words based on uppercase letters
	const words = key.split(/(?=[A-Z])/);
	
	// Convert the first character of each word to uppercase and the rest to lowercase
	const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
	
	// Join the words back into a string with spaces and return
	return capitalizedWords.join(' ');
};

export const getFontColorByTransactionType = (type) => {
	return type == 'income' ? 'text-primary' : 'text-danger'
}

export const getWeekDateRange = (date) => {
	const currentDate = new Date(date);
	const firstDayOfWeek = new Date(
		currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)
	);
	const lastDayOfWeek = new Date(firstDayOfWeek);
	lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
	
	const formatDay = (date) =>
		`${date.getFullYear()}-${(date.getMonth() + 1)
			.toString()
			.padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	
	return {
		start: formatDay(firstDayOfWeek),
		end: formatDay(lastDayOfWeek),
	};
}



export const getDayInfo = (dateString) => {
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const date = new Date(dateString);
	
	
	let dayNumber = date.getDate();
	dayNumber = dayNumber.toString().padStart(2, '0');
	let dayAbbr = days[date.getDay()]; // Use getDay() to index into array

	return {
		dayNumber: dayNumber, // ISO day number (01-07)
		dayAbbr: dayAbbr // Abbreviated day name
	};
}

export const convertMonth = (dateString) => {
	// Define an array of month names, indexed from 0 to 11
	const monthNames = [
		"January", "February", "March",
		"April", "May", "June",
		"July", "August", "September",
		"October", "November", "December"
	];
	
	// Extract the month part from the input and convert it to a zero-based index
	const monthIndex = parseInt(dateString.split("-")[1], 10) - 1;
	
	// Return the corresponding month name
	return monthNames[monthIndex];
}

export const convertDate = (input) => {
	// Attempt to parse the input string into a Date object
	const date = new Date(input);
	
	// Check if the date is valid
	if (isNaN(date.getTime())) {
		throw new Error("Invalid date format");
	}
	
	// Extract the month and day from the Date object
	const month = (date.getMonth() + 1).toString().padStart(2, '0'); // GetMonth returns 0-11; add 1 for 1-12
	const day = date.getDate().toString().padStart(2, '0'); // GetDate returns the day of the month (1-31)
	
	// Return the formatted string as "MM/DD"
	return `${month}/${day}`;
}



export const getDueDate = (billingCycle) => {
	const dueDate = new Date(billingCycle.end);
	dueDate.setDate(dueDate.getDate() + 21); // Adding 21 days to end of billing cycle
	const remainingDays = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
	return { date: dueDate, remainingDays };
};

export const getBillingCycle = (transaction, account) => {
	const transactionDate = new Date(transaction.transactionDate);
	const lastMonth = new Date(transactionDate);
	lastMonth.setMonth(lastMonth.getMonth() - 1);
	
	const lastMonthBillGenDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), parseInt(account.billGenerationDate) + 1);
	const thisMonthBillGenDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), parseInt(account.billGenerationDate));
	thisMonthBillGenDate.setDate(thisMonthBillGenDate.getDate() - 1); // Subtract one day to get last day of previous month
	
	return {
		start: lastMonthBillGenDate,
		end: thisMonthBillGenDate,
	}
};
