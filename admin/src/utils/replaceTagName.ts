const toCamelCase = (str: string) => {
	return str.split(' ').map(function(word, index) {
		// If it is the first word make sure to lowercase all the chars.
		if (index == 0) {
			return word.toLowerCase();
		}
		// If it is not the first word only upper case the first char and lowercase the rest.
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join('');
}

const replaceTagName = (message: string, tagsName: string) => {
	const tagsNameCamelCase = toCamelCase(tagsName);
	message = message.replaceAll("tags", tagsName);
	message = message.replaceAll("Tags", tagsNameCamelCase);
	return message;
}

export { replaceTagName };