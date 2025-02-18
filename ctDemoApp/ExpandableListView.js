// import React, { Component, ReactNode } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     LayoutAnimation,
//     StyleSheet
// } from 'react-native';

// // Define prop types
// interface ExpandableListViewProps {
//     item: {
//         categoryName: string;
//         subCategory?: { name: string }[]; // optional array of subcategory items
//     };
//     onItemPress: (item: { name: string }) => void; // callback for subcategory item press
//     children?: ReactNode;
// }

// // Define state types
// interface ExpandableListViewState {
//     layoutHeight: number | null;
// }

// export class ExpandableListView extends Component<ExpandableListViewProps, ExpandableListViewState> {
//     constructor(props: ExpandableListViewProps) {
//         super(props);
//         this.state = {
//             layoutHeight: 0,
//         };
//     }

//     onCategoryPress = () => {
//         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//         const height = this.state.layoutHeight !== 0 ? 0 : null;
//         this.setState({ layoutHeight: height });
//     };

//     render() {
//         return (
//             <View>
//                 <TouchableOpacity
//                 activeOpacity={0.8}
//                 onPress={this.onCategoryPress}
//                 style={styles.categoryView}
//             >
//                 <Text style={styles.categoryText}>
//                     {this.props.item.categoryName}
//                 </Text>

//                 {this.state.layoutHeight !== 0 ? (
//                     <Text style={styles.iconStyle}>
//                         {'^'}
//                     </Text>
//                 ) : (
//                     <Text style={styles.iconStyle}>
//                         {'>'}
//                     </Text>
//                 )}
//             </TouchableOpacity>

//                 <View style={{ height: this.state.layoutHeight || 0, overflow: 'hidden' }}>
//                     {this.props.children}
//                     {this.props.item.subCategory?.map((item, key) => (
//                         <TouchableOpacity
//                             key={key}
//                             style={styles.subCategory}
//                             onPress={() => this.props.onItemPress(item)}
//                         >
//                             <Text style={styles.subCategoryText}>{item.name}</Text>
//                             <View style={styles.separator} />
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//             </View>
//         );
//     }
// }

// const styles = StyleSheet.create({
//     iconStyle: {
//         width: 22,
//         height: 22,
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//         color: '#fff',
//         fontWeight: '900',
//     },
//     subCategory: {
//         fontSize: 20,
//         color: '#000',
//         padding: 10,
//     },
//     categoryText: {
//         textAlign: 'left',
//         color: '#fff',
//         fontSize: 22,
//         padding: 12,
//     },
//     categoryView: {
//         marginVertical: 5,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         backgroundColor: '#DC2626',
//     },
//     subCategoryText: {
//         fontSize: 18,
//     },
//     separator: {
//         width: '100%',
//         height: 1,
//         backgroundColor: '#000',
//     },
// });




import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    LayoutAnimation,
    StyleSheet
} from 'react-native';

export class ExpandableListView extends Component {
    constructor() {
        super();
        this.state = {
            layoutHeight: 0,
        };
    }

    onCategoryPress = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        let height = this.state.layoutHeight != 0 ? 0 : null;
        this.setState({ layoutHeight: height });
    };

    render() {
        return (
            <View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={this.onCategoryPress}
                    style={styles.categoryView}>

                    <Text style={styles.categoryText}>
                        {this.props.item.categoryName}
                    </Text>
                    {this.state.layoutHeight != 0 &&
                        <Text style={styles.iconStyle} visible={false}>
                            {'^'}
                        </Text>
                    }

                    {this.state.layoutHeight == 0 &&
                        <Text style={styles.iconStyle}>
                            {'>'}
                        </Text>
                    }

                </TouchableOpacity>
                <View style={{ height: this.state.layoutHeight, overflow: 'hidden' }}>
                    {this.props.children}
                    {this.props.item.subCategory && this.props.item.subCategory.map((item, key) => (
                        <TouchableOpacity
                            key={key}
                            style={styles.subCategory}
                            onPress={() => this.props.onItemPress(item)}>
                            <Text style={styles.subCategoryText}>{item.name}</Text>
                            <View style={styles.separator} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    iconStyle: {
        width: 22,
        height: 22,
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: '#fff',
        fontWeight: '900',
    },
    subCategory: {
        fontSize: 20,
        color: '#000',
        padding: 10,
    },
    categoryText: {
        textAlign: 'left',
        color: '#fff',
        fontSize: 22,
        padding: 12,
    },
    categoryView: {
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#DC2626',
    },
    subCategoryText: {
        fontSize: 18,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#000',
    },
});