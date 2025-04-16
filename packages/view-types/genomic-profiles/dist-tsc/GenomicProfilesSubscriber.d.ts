/**
 * A component for visualization of genomic profiles
 * with genome-wide bar plots.
 * @param {object} props The component props.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.profileTrackUidKey The key in the genomic profiles row_info that identifies
 * each track. By default, 'path'.
 * @param {string} props.profileTrackNameKey The key in the genomic profiles row_info that
 * gives a name for each track. By default, null. When null is provided, uses the
 * profileTrackUidKey for both UID and name. If UID values are path arrays,
 * they will be converted to name strings.
 * @param {string} props.higlassServer The URL for the higlass server used to retreive
 * reference tilesets for the chromosome and gene annotations.
 * @param {string} props.assembly The genome assembly to use for the reference
 * tilesets for the chromosome and gene annotations.
 * @param {string} props.title The title of the component.
 */
export function GenomicProfilesSubscriber(props: {
    theme: string;
    coordinationScopes: object;
    removeGridComponent: Function;
    profileTrackUidKey: string;
    profileTrackNameKey: string;
    higlassServer: string;
    assembly: string;
    title: string;
}): JSX.Element;
//# sourceMappingURL=GenomicProfilesSubscriber.d.ts.map