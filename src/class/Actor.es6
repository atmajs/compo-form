var IActor = mask.class.create({
	run (name, ...args) {
		this.error = null;
		
		var actions = this[name],
			result;
		
		args.unshift(this);
		actions.forEach(x => {
			if (this.error) {
				return;
			}
			result = this.perform(x, args);
		});
		return result;
	},
	perform_ (mix, args) {
		var fn = typeof mix === 'string' ? this[mix] : mix;
		try {
			return fn.apply(null, args);
		} catch(error) {
			this.error = error;
			this.throw_(error);
		}
	},
	throw_ (error) {
		throw error;
	}
})
