// Copyright 2026, University of Colorado Boulder

/**
 * Plays sounds for user-initiated paper number combining, decomposing, and repelling.
 *
 * @author Reid S. (PhET Interactive Simulations)
 */

import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import collect_mp3 from '../../../../tambo/sounds/collect_mp3.js';
import erase_mp3 from '../../../../tambo/sounds/erase_mp3.js';
import selectionArpeggio003_mp3 from '../../../../tambo/sounds/selectionArpeggio003_mp3.js';

const MAX_PLACE = 3;

class CountingObjectSoundPlayer {

  private readonly combineSoundClip: SoundClip;
  private readonly decomposeSoundClip: SoundClip;
  private readonly repelSoundClip: SoundClip;

  public constructor() {

    const soundClipOptions = {
      rateChangesAffectPlayingSounds: false
    };

    this.combineSoundClip = new SoundClip( collect_mp3, soundClipOptions );
    this.decomposeSoundClip = new SoundClip( selectionArpeggio003_mp3, soundClipOptions );
    this.repelSoundClip = new SoundClip( erase_mp3, soundClipOptions );

    soundManager.addSoundGenerator( this.combineSoundClip );
    soundManager.addSoundGenerator( this.decomposeSoundClip );
    soundManager.addSoundGenerator( this.repelSoundClip );
  }

  public playCombineSound( place: number ): void {
    this.playSound( this.combineSoundClip, place );
  }

  public playDecomposeSound( place: number ): void {
    this.playSound( this.decomposeSoundClip, place );
  }

  public playRepelSound( place: number ): void {
    this.playSound( this.repelSoundClip, place );
  }

  private playSound( soundClip: SoundClip, place: number ): void {
    soundClip.setPlaybackRate( CountingObjectSoundPlayer.placeToPlaybackRate( place ) );
    soundClip.play();
  }

  /**
   * For sounds that are keyed to a specific place value, play 1s at the natural pitch, then lower each larger place
   * value by two half steps.
   */
  private static placeToPlaybackRate( place: number ): number {
    const constrainedPlace = Math.max( 0, Math.min( MAX_PLACE, place ) );
    return Math.pow( 2, -2 * constrainedPlace / 12 );
  }

  /**
   * Determine the lowest non-zero place in a number. For example, 70 maps to the 10s place.
   */
  private static getLowestNonZeroPlace( numberValue: number ): number {
    assert && assert( numberValue > 0 && numberValue % 1 === 0, 'numberValue should be a positive integer' );

    let place = 0;
    let remainingValue = numberValue;
    while ( remainingValue % 10 === 0 ) {
      place++;
      remainingValue = remainingValue / 10;
    }
    return Math.min( MAX_PLACE, place );
  }

  /**
   * Combine and repel sounds are associated with the smallest place value involved in the interaction.
   */
  public static getInteractionPlace( numberValue1: number, numberValue2: number ): number {
    return Math.min(
      CountingObjectSoundPlayer.getLowestNonZeroPlace( numberValue1 ),
      CountingObjectSoundPlayer.getLowestNonZeroPlace( numberValue2 )
    );
  }

  /**
   * Decompose sounds are associated with the largest place value in the decomposed portion.
   */
  public static getDecomposedValuePlace( numberValue: number ): number {
    assert && assert( numberValue > 0 && numberValue % 1 === 0, 'numberValue should be a positive integer' );
    return Math.min( MAX_PLACE, `${numberValue}`.length - 1 );
  }
}

const countingObjectSoundPlayer = new CountingObjectSoundPlayer();

export default countingObjectSoundPlayer;
export { CountingObjectSoundPlayer };
