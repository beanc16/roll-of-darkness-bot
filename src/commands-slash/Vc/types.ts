import EventEmitter from 'node:events';

import { AudioPlayer } from '@discordjs/voice';

/*
 * Only AudioPlayer.on exists on the AudioPlayer type,
 * despite other EventEmitter methods being functional
 * parts of the class. Therefore, we need to extend the
 * AudioPlayer type with the EventEmitter type to
 * ensure that all functional event methods show up
 * in the type.
 */
export type AudioPlayerEmitter = AudioPlayer & EventEmitter;
