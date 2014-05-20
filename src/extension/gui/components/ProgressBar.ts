/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// <reference path="../../../egret/display/DisplayObject.ts"/>
/// <reference path="../../../egret/events/Event.ts"/>
/// <reference path="../../../egret/geom/Point.ts"/>
/// <reference path="Label.ts"/>
/// <reference path="ProgressBarDirection.ts"/>
/// <reference path="supportClasses/Animation.ts"/>
/// <reference path="supportClasses/Range.ts"/>
/// <reference path="../core/UIComponent.ts"/>
/// <reference path="../events/MoveEvent.ts"/>
/// <reference path="../events/ResizeEvent.ts"/>

module ns_egret {

	/**
	 * @class ns_egret.ProgressBar
	 * @classdesc
	 * 进度条控件。
	 * @extends ns_egret.Range
	 */
    export class ProgressBar extends Range {
		/**
		 * @method ns_egret.ProgressBar#constructor
		 */
        public constructor() {
            super();
        }

        /**
         * [SkinPart]进度高亮显示对象。
		 * @member ns_egret.ProgressBar#thumb
         */
        public thumb:DisplayObject;
        /**
         * [SkinPart]轨道显示对象，用于确定thumb要覆盖的区域。
		 * @member ns_egret.ProgressBar#track
         */
        public track:DisplayObject;
        /**
         * [SkinPart]进度条文本
		 * @member ns_egret.ProgressBar#labelDisplay
         */
        public labelDisplay:Label;

        private _labelFunction:Function;
        /**
         * 进度条文本格式化回调函数。示例：labelFunction(value:Number,maximum:Number):String;
		 * @member ns_egret.ProgressBar#labelFunction
         */
        public get labelFunction():Function {
            return this._labelFunction;
        }

        public set labelFunction(value:Function) {
            if (this._labelFunction == value)
                return;
            this._labelFunction = value;
            this.invalidateDisplayList();
        }

        /**
         * 将当前value转换成文本
		 * @method ns_egret.ProgressBar#valueToLabel
		 * @param value {number} 
		 * @param maximum {number} 
		 * @returns {string}
         */
        public valueToLabel(value:number, maximum:number):string {
            if (this.labelFunction != null) {
                return this._labelFunction(value, maximum);
            }
            return value + " / " + maximum;
        }

        private _slideDuration:number = 500;

        /**
         * value改变时调整thumb长度的缓动动画时间，单位毫秒。设置为0则不执行缓动。默认值500。
		 * @member ns_egret.ProgressBar#slideDuration
         */
        public get slideDuration():number {
            return this._slideDuration;
        }

        public set slideDuration(value:number) {
            if (this._slideDuration == value)
                return;
            this._slideDuration = value;
            if (this.animator && this.animator.isPlaying) {
                this.animator.stop();
                this._setValue(this.slideToValue);
            }
        }

        private _direction:string = ProgressBarDirection.LEFT_TO_RIGHT;
        /**
         * 进度条增长方向。请使用ProgressBarDirection定义的常量。默认值：ProgressBarDirection.LEFT_TO_RIGHT。
		 * @member ns_egret.ProgressBar#direction
         */
        public get direction():string {
            return this._direction;
        }

        public set direction(value:string) {
            if (this._direction == value)
                return;
            this._direction = value;
            this.invalidateDisplayList();
        }

        /**
         * 动画实例
         */
        private animator:Animation;
        /**
         * 动画播放结束时要到达的value。
         */
        private slideToValue:number;

        /**
         * 进度条的当前值。
         * 注意：当组件添加到显示列表后，若slideDuration不为0。设置此属性，并不会立即应用。而是作为目标值，开启缓动动画缓慢接近。
         * 若需要立即重置属性，请先设置slideDuration为0，或者把组件从显示列表移除。
		 * @member ns_egret.ProgressBar#value
         */
        public get value():number {
            return this._getValue();
        }

        public set value(newValue:number) {
            if (this._getValue() == newValue)
                return;
            if (this._slideDuration == 0 || !this.stage) {
                this._setValue(newValue);
            }
            else {
                this.validateProperties();//最大值最小值发生改变时要立即应用，防止当前起始值不正确。
                this.slideToValue = this.nearestValidValue(newValue, this.snapInterval);
                if (this.slideToValue == this._getValue())
                    return;
                if (!this.animator) {
                    this.animator = new Animation(this.animationUpdateHandler,this);
                }
                if (this.animator.isPlaying) {
                    this.setValue(this.nearestValidValue(this.animator.motionPaths[0].valueTo, this.snapInterval));
                    this.animator.stop();
                }
                var duration:number = this._slideDuration *
                    (Math.abs(this._getValue() - this.slideToValue) / (this.maximum - this.minimum));
                this.animator.duration = duration === Infinity ? 0 : duration;
                this.animator.motionPaths = [
                    {prop: "value", from: this._getValue(), to: this.slideToValue}
                ];
                this.animator.play();
            }
        }

        /**
         * 动画播放更新数值
         */
        private animationUpdateHandler(animation:Animation):void {
            this.setValue(this.nearestValidValue(animation.currentValue["value"], this.snapInterval));
        }

        /**
		 * @method ns_egret.ProgressBar#setValue
		 * @param value {number} 
         */
        public setValue(value:number):void {
            super.setValue(value);
            this.invalidateDisplayList();
        }

        /**
		 * @method ns_egret.ProgressBar#updateDisplayList
		 * @param unscaledWidth {number} 
		 * @param unscaledHeight {number} 
         */
        public updateDisplayList(unscaledWidth:number, unscaledHeight:number):void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            this.updateSkinDisplayList();
        }

        /**
		 * @method ns_egret.ProgressBar#partAdded
		 * @param partName {string} 
		 * @param instance {any} 
         */
        public partAdded(partName:string, instance:any):void {
            if (instance == this.track) {
                if (this.track instanceof UIComponent) {
                    this.track.addEventListener(ResizeEvent.RESIZE, this.onTrackResizeOrMove, this);
                    this.track.addEventListener(MoveEvent.MOVE, this.onTrackResizeOrMove, this);
                }
            }
        }

        /**
		 * @method ns_egret.ProgressBar#partRemoved
		 * @param partName {string} 
		 * @param instance {any} 
         */
        public partRemoved(partName:string, instance:any):void {
            if (instance == this.track) {
                if (this.track instanceof UIComponent) {
                    this.track.removeEventListener(ResizeEvent.RESIZE, this.onTrackResizeOrMove, this);
                    this.track.removeEventListener(MoveEvent.MOVE, this.onTrackResizeOrMove, this);
                }
            }
        }

        private trackResizedOrMoved:boolean = false;

        /**
         * track的位置或尺寸发生改变
         */
        private onTrackResizeOrMove(event:Event):void {
            this.trackResizedOrMoved = true;
            this.invalidateProperties();
        }

		/**
		 * @method ns_egret.ProgressBar#commitProperties
		 */
        public commitProperties():void {
            super.commitProperties();
            if (this.trackResizedOrMoved) {
                this.trackResizedOrMoved = false;
                this.updateSkinDisplayList();
            }
        }

        /**
         * 更新皮肤部件大小和可见性。
		 * @method ns_egret.ProgressBar#updateSkinDisplayList
         */
        public updateSkinDisplayList():void {
            this.trackResizedOrMoved = false;
            var currentValue:number = isNaN(this.value) ? 0 : this.value;
            var maxValue:number = isNaN(this.maximum) ? 0 : this.maximum;
            if (this.thumb && this.track) {
                var trackWidth:number = isNaN(this.track.width) ? 0 : this.track.width;
                trackWidth *= this.track.scaleX;
                var trackHeight:number = isNaN(this.track.height) ? 0 : this.track.height;
                trackHeight *= this.track.scaleY;
                var thumbWidth:number = Math.round((currentValue / maxValue) * trackWidth);
                if (isNaN(thumbWidth) || thumbWidth < 0 || thumbWidth === Infinity)
                    thumbWidth = 0;
                var thumbHeight:number = Math.round((currentValue / maxValue) * trackHeight);
                if (isNaN(thumbHeight) || thumbHeight < 0 || thumbHeight === Infinity)
                    thumbHeight = 0;

                var p:Point = this.track.localToGlobal(0, 0);
                var thumbPos:Point = this.globalToLocal(p.x, p.y);
                var thumbPosX:number = thumbPos.x;
                var thumbPosY:number = thumbPos.y;

                switch (this._direction) {
                    case ProgressBarDirection.LEFT_TO_RIGHT:
                        this.thumb.width = thumbWidth;
                        this.thumb.x = thumbPosX;
                        break;
                    case ProgressBarDirection.RIGHT_TO_LEFT:
                        this.thumb.width = thumbWidth;
                        this.thumb.x = thumbPosX + trackWidth - thumbWidth;
                        break;
                    case ProgressBarDirection.TOP_TO_BOTTOM:
                        this.thumb.height = thumbHeight;
                        this.thumb.y = thumbPosY;
                        break;
                    case ProgressBarDirection.BOTTOM_TO_TOP:
                        this.thumb.height = thumbHeight;
                        this.thumb.y = thumbPosY + trackHeight - thumbHeight;
                        break;
                }

            }
            if (this.labelDisplay) {
                this.labelDisplay.text = this.valueToLabel(currentValue, maxValue);
            }
        }
    }
}