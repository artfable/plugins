/**
 * @author artfable
 * 24.04.16
 */
;(function(factory) {
    'use strict';

    if ($) {
        factory($);
    } else if (require) {
        require(['jquery'], factory)
    } else {
        throw new ReferenceError('No jQuery! You should initialize it first.');
    }
})(function($) {
    'use strict';

    if (!$.isFunction($.widget)) {
        throw new ReferenceError('No jQueryUi widget! You should initialize it first.');
    }

    $.widget('material.timepicker', {
        options: {
            container: null,
            prefix: 'md',
            startHour: 0,
            startMinute: 0,
            setLabelActive: true,
            cancelBtnName: 'Clean'
        },
        _create: function() {
            if (this.options.container) {
                this.options.container = $(this.options.container);
            } else {
                this.options.container = this.element.parent()
            }

            this.time = {
                hour: this._pad(this.options.startHour),
                minute: this._pad(this.options.startMinute)
            };

            this.element.addClass(this.options.prefix + '-timepiker-input');
            this.$el = $('<div class="' + this.options.prefix + '-timepicker-wrapper picker__holder">');

            var $clock = $('<ul class="' + this.options.prefix + '-timepicker-clock">');

            var $timeBlock = $('<div class="' + this.options.prefix + '-timepicker-time-block">').append('<div class="row">');
            this._buildTimeBlock($timeBlock, $clock);

            var $clockBlock = $('<div class="' + this.options.prefix + '-timepicker-clock-block">').append($clock);
            this._renderHours($clock);

            var $footerBlock = $('<div class="' + this.options.prefix + '-timepicker-footer picker__footer">'
                + '<button type="button" class="btn-flat ' + this.options.prefix + '-timepicker-clean-btn picker__clear">' + this.options.cancelBtnName + '</button>'
                + '</div>');

            this._on($footerBlock.children('.' + this.options.prefix + '-timepicker-clean-btn'), {
                click: function() {
                    this.options.container.removeClass('picker--opened');
                }
            });

            var $frame = $('<div class="' + this.options.prefix + '-timepicker-block picker__frame">');
            this.$el.append($frame.append($timeBlock).append($clockBlock).append($footerBlock));

            this._on(this.element, {
                click: 'open'
            });

            this._on($frame, {
                click: function(event) {
                    event.stopPropagation();
                }
            });

            this._on(this.$el, {
                click: 'close'
            });

            this.options.container.append(this.$el);
        },

        _destroy: function() {
            this.options.container.removeClass('picker--opened');
            this.$el.remove();
        },

        _buildTimeBlock: function($timeBlock, $clock) {
            var $hour = $('<div class="col s3 offset-s2 active">' + this.time.hour + '</div>');
            var $minute = $('<div class="col s3">' + this.time.minute + '</div>');
            $timeBlock.children()
                .append($hour)
                .append('<div class="col s2">:</div>')
                .append($minute);

            this._on($hour, {
                click: function() {
                    $minute.removeClass('active');
                    $hour.addClass('active');
                    this._renderHours($clock)
                }
            });

            this._on($minute, {
                click: function() {
                    $hour.removeClass('active');
                    $minute.addClass('active');
                    this._renderMinutes($clock)
                }
            });
        },

        _pad: function(number) {
            var str = '0' + number;
            return str.substr(str.length - 2);
        },

        _setHour: function(hour) {
            this.time.hour = hour;
            this.$el.find('.' + this.options.prefix + '-timepicker-time-block .row').children().first().html(this._pad(hour));
        },

        _setMinute: function(minute) {
            this.time.minute = minute;
            this.$el.find('.' + this.options.prefix + '-timepicker-time-block .row').children().last().html(this._pad(minute));
        },

        _renderHours: function($clock) {
            var that = this;

            this._emptyClock($clock, function() {
                var setHour = function(hour) {
                    return function() {
                        that._setHour(hour);
                    }
                };

                for (var i = 0; i < 12; i++) {
                    $('<li>' + i + '</li>').css('transform', 'rotate(' + 30 * i + 'deg) translateY(-125px) rotate(-' + 30 * i + 'deg)').appendTo($clock).click(setHour(i));
                    $('<li>' + (i + 12) + '</li>').css('transform', 'rotate(' + (30 * i + 15) + 'deg) translateY(-90px) rotate(-' + (30 * i + 15) + 'deg)').appendTo($clock).click(setHour(i + 12));
                }
                setTimeout(function() {
                    $clock.children().css('opacity', 1);
                }, 100);
            });
        },

        _renderMinutes: function($clock) {
            var that = this;

            this._emptyClock($clock, function() {
                var setMinute = function(minute) {
                    return function() {
                        that._setMinute(minute);
                    }
                };

                var minute = 0;
                for (var i = 0; i < 12; i++) {
                    $('<li>' + minute + '</li>').css('transform', 'rotate(' + 30 * i + 'deg) translateY(-105px) rotate(-' + 30 * i + 'deg)').appendTo($clock).click(setMinute(minute));
                    minute += 5;
                }
                setTimeout(function() {
                    $clock.children().css('opacity', 1);
                }, 100);
            });
        },

        _emptyClock: function($clock, callback) {
            $clock.append('<li>').children().css('transform', '').css('opacity', '0').delay(800).queue(function() { // append('<li>') - to force queue works
                $clock.empty();
                if (callback) {
                    callback();
                }
            });
        },

    //    Methods
        close: function() {
            this.element.val(this._pad(this.time.hour) + ' : ' + this._pad(this.time.minute));
            if (this.options.setLabelActive) {
                this.element.parent().children('label').addClass('active'); // repair materialize trouble
            }
            this.options.container.removeClass('picker--opened');
        },

        open: function() {
            var time = this.element.val();
            if (time) {
                time = time.split(':');
                if (time.length == 2) {
                    this.time = {
                        hour: parseInt(time[0]),
                        minute: parseInt(time[1])
                    };
                    var $timeBlockChildren = this.$el.find('.' + this.options.prefix + '-timepicker-time-block .row').children();
                    $timeBlockChildren.first().html(this._pad(this.time.hour));
                    $timeBlockChildren.last().html(this._pad(this.time.minute));
                }
            }

            this.options.container.addClass('picker--opened');
        }
    });
});