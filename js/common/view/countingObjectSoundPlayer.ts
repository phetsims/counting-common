// Copyright 2026, University of Colorado Boulder

/**
 * Plays sounds for user-initiated paper number combining, decomposing, and repelling.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import erase_mp3 from '../../../../tambo/sounds/erase_mp3.js';
import paperComposeWav from '../../../sounds/paper-compose_wav.js';
import paperDecomposeWav from '../../../sounds/paper-decompose_wav.js';

const MAX_PLACE = 3;

const composeSoundClip = new SoundClip( paperComposeWav );
const decomposeSoundClip = new SoundClip( paperDecomposeWav );
const repelSoundClip = new SoundClip( erase_mp3 );

soundManager.addSoundGenerator( composeSoundClip );
soundManager.addSoundGenerator( decomposeSoundClip );
soundManager.addSoundGenerator( repelSoundClip );

const VOLUME = 0.4;

composeSoundClip.setOutputLevel( VOLUME * 0.5 );
decomposeSoundClip.setOutputLevel( VOLUME * 0.3 );

class CountingObjectSoundPlayer {

  public playCombineSound(): void {
    composeSoundClip.play();
  }

  public playDecomposeSound(): void {
    decomposeSoundClip.play();
  }

  public playRepelSound(): void {
    repelSoundClip.play();
  }

  /**
   * Plays when a number starts being dragged from the number drawer.
   */
  public playNumberDrawerPickupSound(): void {
    sharedSoundPlayers.get( 'toggleOn' ).play();
  }

  /**
   * Plays when a number is dropped into the number drawer.
   */
  public playNumberDrawerDropSound(): void {
    sharedSoundPlayers.get( 'toggleOff' ).play();
  }

  /**
   * Plays when a number is picked up in the play area.
   */
  public playPlayAreaPickupSound(): void {
    sharedSoundPlayers.get( 'grab' ).play();
  }

  /**
   * Plays when a number is dropped in the play area.
   */
  public playPlayAreaDropSound(): void {
    sharedSoundPlayers.get( 'release' ).play();
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
