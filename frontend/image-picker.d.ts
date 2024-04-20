declare module 'react-native-image-picker' {
    export interface ImageLibraryOptions {
        mediaType: MediaType;
        quality?: number;
        selectionLimit: number;
        includeBase64: boolean;
    }

    export type MediaType = 'photo' | 'video' | 'mixed';

    export function launchImageLibrary(options: ImageLibraryOptions, callback: (response: ImagePickerResponse) => void): void;
}