(function (window) {

	function RemoteClock(server, callback) {
		var synced = false,
			done = false,
			socket,
			minDiff = Infinity,
			maxDiff = -Infinity,
			accuracy = Infinity,
			timingDiff = 0;

		function onMessage(message) {
			var clientReceived,
				improved = false,
				acc;

			if (!message) {
				return;
			}

			clientReceived = Date.now();

			if (message.timing !== undefined) {
				minDiff = Math.min(minDiff, clientReceived - message.timing);

				if (minDiff !== undefined) {
					if (message.maxDiff !== undefined) {
						maxDiff = message.maxDiff;
						timingDiff = minDiff + (maxDiff - minDiff) / 2;

						acc = Math.abs(maxDiff - minDiff);
						improved = accuracy - acc >= 20;
						accuracy = acc;
						console.log('remote clock', Date.now() - timingDiff, timingDiff, accuracy);
						if (acc < 200) {
							if (!synced) {
								synced = true;
								//todo: fire callback
							}

							if (acc < 50) {
								done = true;
							}
						}
						if ((improved || done) && callback) {
							callback();
						}
					} else {
						timingDiff = minDiff;
					}
				}
			}
		}

		function requestTiming() {
			socket.json.send({
				action: 'sync',
				minDiff: minDiff,
				timing: Date.now()
			});
			if (!done) {
				setTimeout(requestTiming, 1000);
			}
		}

		if (!window.io) {
			throw new Error('Unable to initialize RemoteSync. Missing Socket.IO');
		}

		socket = window.io.connect(server || location.origin);
		socket.on('message', onMessage);
		socket.on('connect', function() {
			requestTiming();
		});

		this.time = function () {
			return Date.now() - timingDiff;
		};

		this.accuracy = function () {
			return accuracy;
		};
	}

	window.RemoteClock = RemoteClock;
}(this));