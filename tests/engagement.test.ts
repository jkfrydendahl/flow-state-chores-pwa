import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProgress,readProgress,transition} from '../src/lib/progress.ts';
import {remaining,fiveMinutes,readTimer} from '../src/lib/engagement.ts';
import {roomOrder} from '../src/content/rooms.ts';
const timed = () => transition(transition(initialProgress(), {type:'engagement',key:'timer',value:true}), {type:'start'},1000);
test('quiet default and existing records do not start timers',()=>{
 const old=initialProgress();
 const raw=JSON.parse(JSON.stringify(old));delete raw.engagement;
 const state=transition(readProgress(JSON.stringify(raw)),{type:'start'},1000);
 assert.equal(state.sessions.kitchen?.timer,undefined);

});
test('deadline survives reload and expiry does not finish or advance the quest',()=>{
 const state=readProgress(JSON.stringify(timed()),400000);
 assert.equal(remaining(state.sessions.kitchen!.timer!,400000),0);
 assert.equal(state.activeRoom,'kitchen');assert.equal(state.lastCompleted,null);
 assert.deepEqual(state.queue,roomOrder);
 const continued=transition(state,{type:'continue'});
 assert.equal(readProgress(JSON.stringify(continued)).sessions.kitchen?.timer,undefined);
 assert.equal(continued.activeRoom,'kitchen');
});
test('pause freezes time; resume preserves remaining time and independent room timers',()=>{
 let state=transition(timed(),{type:'pause'},61000);
 assert.equal(state.sessions.kitchen?.timer?.remainingMs,240000);
 state=transition(state,{type:'room',room:'bathroom'});
 state=transition(state,{type:'start'},100000);
 state=transition(state,{type:'pause'},130000);
 assert.equal(state.sessions.bathroom?.timer?.remainingMs,270000);
 state=readProgress(JSON.stringify(state),900000);
 state=transition(state,{type:'room',room:'kitchen'});
 state=transition(state,{type:'resume'},900000);
 assert.equal(remaining(state.sessions.kitchen!.timer!,900000),240000);
 assert.equal(state.sessions.bathroom?.timer?.remainingMs,270000);
});
test('preferences persist; finishing early removes the timer with the session',()=>{
 let state=timed();
 state=transition(state,{type:'engagement',key:'hideTimer',value:true});
 state=readProgress(JSON.stringify(state));
 assert.equal(state.engagement.hideTimer,true);
 state=transition(state,{type:'complete',at:'2026-09-06T12:00:00Z'});
 assert.equal(state.sessions.kitchen,undefined);assert.equal(state.lastCompleted?.mode,'minimal');
});
test('invalid timer data is ignored',()=>{
 for(const value of [null,{}, {remainingMs:-1,endsAt:null},{remainingMs:fiveMinutes+1,endsAt:0},{remainingMs:0,endsAt:'bad'}]) assert.equal(readTimer(value),undefined);
});
