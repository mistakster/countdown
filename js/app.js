"use strict";

function padZero(str) {
	return ("00" + str).substr(-2);
}

function parseValue(str) {
	str = ("" + str).trim();
	return str === "" ? 0 : parseInt(str, 10);
}

var Timer = function (m, s, root) {
	this.total = this.scheduled = Timer.toSeconds(m, s);
	this.root = root;
};

Timer.toSeconds = function (m, s) {
	return m * 60 + s;
};

Timer.prototype = {
	run: function () {
		var me = this;

		function intervalCallback() {
			var t = me.getRest(),
				cm = Math.floor(t / 60),
				cs = Math.floor(t - cm * 60);

			if (t <= 0) {
				me.stop();
				$(me.root).trigger("update.timer", [0, 0]);
				$(me.root).trigger("alarm.timer");
			} else {
				$(me.root).trigger("update.timer", [cm, cs]);
			}
		}

		this.stop();
		this.startTime = new Date();
		this.interval = setInterval(intervalCallback, 1000);
		$(this.root).trigger("run.timer");
		intervalCallback();
	},
	pause: function () {
		this.stop();
		this.scheduled = this.getRest();
		$(this.root).trigger("pause.timer");
	},
	stop: function () {
		if (this.interval) {
			clearInterval(this.interval);
			delete this.interval;
		}
		$(this.root).trigger("stop.timer");
	},
	getRest: function () {
		return this.scheduled - Math.round((new Date() - this.startTime) / 1000);
	}
};

var timer, totalTimer;

$("#timer").bind({
	"submit": function () {

		var m = parseValue($("#minutes").val()),
			s = parseValue($("#seconds").val());

		if (!isNaN(m) && !isNaN(s)) {
			if (timer && timer.stop) {
				timer.stop();
			}
			timer = new Timer(m, s, "#timer");
			timer.run();
		}

		$(this).each(function () {
			var $total = $(".timer__total", this);

			if (totalTimer) {
				clearTimeout(totalTimer);
			}

			var now = +new Date();
			(function total() {
				var t = Math.round(((+new Date()) - now) / 1000);
				var m = Math.floor(t / 60);
				var s = Math.floor(t - m * 60);
				$total.html(padZero(m) + ":" + padZero(s));
				totalTimer = setTimeout(total, 1000);
			}());
		});

		return false;
	},

	"run.timer": function () {
		$(this).addClass("timer_running").removeClass("timer_paused");
	},

	"pause.timer": function () {
		$(this).addClass("timer_paused");
	},

	"stop.timer": function () {
		$(this).removeClass("timer_running timer_paused");
	},

	"alarm.timer": function () {
		$("#alarm").each(function () {
			if ($.isFunction(this.play)) {
				this.play();
			}
		});
	},

	"update.timer": function (e, m, s) {
		$("#m").html(padZero(m));
		$("#s").html(padZero(s));

		document.title = $("#display").text();

		$("#progress").height((100 * Timer.toSeconds(m, s) / timer.total) + "%");
	}
});

$("#pause").bind("click", function () {
	if (timer && timer.pause) {
		timer.pause();
	}
});

$("#resume").bind("click", function () {
	if (timer && timer.run) {
		timer.run();
	}
});
