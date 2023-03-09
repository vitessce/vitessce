import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { GenomicProfilesSubscriber } from './GenomicProfilesSubscriber';
import { HiGlassSubscriber } from './HiGlassSubscriber';

export function registerGenomicProfiles() {
  registerPluginViewType(
    ViewType.GENOMIC_PROFILES,
    GenomicProfilesSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.GENOMIC_PROFILES],
  );
}

export function registerHiglass() {
  registerPluginViewType(
    'higlass',
    HiGlassSubscriber,
    COMPONENT_COORDINATION_TYPES.higlass,
  );
}
